// @ts-check

import fs from 'node:fs';

import child_process from 'node:child_process';
import { promisify } from 'node:util';

import crypto from 'node:crypto';

const exec = promisify(child_process.exec);

class Path {
    /** @param {string} path */
    constructor(path) {
        this.path = path;
    }

    /**
     * @param {string} path
     * @returns {Path}
     */
    static build(path) {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        return new Path(path);
    }

    /**
     * @param {string} subpath
     * @returns {Path}
     */
    extend_dir(subpath) {
        if (subpath.length <= 0) {
            throw new Error('Cannot extend Path with empty subpath');
        }
        if (subpath.at(0) === '/') {
            return Path.build(this.path + subpath);
        }
        return Path.build(this.path + '/' + subpath);
    }

    /**
     * @param {string} subpath
     * @returns {Path}
     */
    extend_file(subpath) {
        if (subpath.length <= 0) {
            throw new Error('Cannot extend Path with empty subpath');
        }
        if (subpath.at(0) === '/') {
            return new Path(this.path + subpath);
        }
        return new Path(this.path + '/' + subpath);
    }

    get str() {
        return this.path;
    }
}

/** @typedef {'none' | 'compiletime' | 'runtime'} Error_Kind */
/**
 * @typedef {Object} Response
 * @property {Error_Kind} err_kind
 * @property {string} stderr
 * @property {string} stdout
 * @property {string} error
 */

/**
 * @param {Path} session_dir
 * @param {string} code
 * @param {string} expected_out
 * @returns {Promise<true | string>}
 */
async function checkCode(session_dir, code, expected_out) {
    const code_name = 'main.c';
    const code_dir = session_dir.extend_dir('code');
    const code_path = code_dir.extend_file(code_name);
    fs.writeFileSync(code_path.str, code);

    const out_name = 'a.out';
    const out_dir = session_dir.extend_dir('bin');

    if (!fs.existsSync('/nix/store')) {
        throw new Error(
            'The system is not NixOS, update the paths for bwrap!!!',
        );
    }

    await exec(
        `bwrap --unshare-all --ro-bind /nix/store /nix/store --ro-bind ${code_dir.str} /src --bind ${out_dir.str} /bin cc -o /bin/${out_name} -Wall /src/${code_name}`,
    );

    const { stdout, stderr } = await exec(
        `bwrap --unshare-all --ro-bind /nix/store /nix/store --ro-bind ${out_dir.str} /bin /bin/${out_name}`,
    );
    if ( expected_out === stdout) {
        return true
    } else {
        return stdout
    };
}

/** @type {import("astro").APIRoute} */
export const POST = async ({ request, cookies }) => {
    const data = await request.json();

    const id = crypto.randomBytes(16).toString('hex');
    if (!cookies.has('session-id'))
        cookies.set('session-id', id, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
        });

    /** @type {Response} */
    let result = {
        err_kind: 'none',
        stderr: '',
        stdout: '',
        error: '',
    };

    const cache_dir = new Path('/tmp/minerva');

    // TODO: Get the session id from cookies, or create one if such doesn't exist
    const temporary_session_id = cookies.get('session-id')?.value;
    if (temporary_session_id === undefined) {
        throw new Error('Session id is undefined');
    }
    const session_dir = cache_dir.extend_dir(temporary_session_id);

    if (data.code === undefined) {
        return new Response(JSON.stringify({ error: 'no code provided' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    if (data.exId === undefined) {
        return new Response(JSON.stringify({ error: 'no exId provided' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const matches = import.meta.glob('/src/content/classes/c-intro/*.mdx', {
        eager: true,
    });

    const { exercises } = matches[`/src/content/classes/${data.exId}.mdx`];
    if (exercises === undefined) {
        return new Response(
            JSON.stringify({
                stderr: 'could not find exercise',
                err_kind: 'compiletime',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
    }

    const total_tests = Object.keys(exercises?.at(0)?.test_data).length;
    let passed_test = 0
    let fail = false

    if (exercises?.at(0)?.test_data !== undefined) {
        for (let test of exercises.at(0).test_data) {
            const input_data = test.input_data;
            const expected_out = test.expected_output;

            const include = Object.keys(input_data)
                .map((k) => `#define ${k} ${input_data[k]}`)
                .join('\n');
            const code = include + '\n\n' + data.code;
            let res;
            try {
                res = await checkCode(session_dir, code, expected_out);
            } catch (err) {
                return new Response(
                    JSON.stringify({
                        stderr: err.stderr,
                        err_kind: 'compiletime',
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
            }
            if (res !== true) { 
            const input_values = Object.keys(input_data)
                .map((k) => `${k} = ${input_data[k]}`)
                .join('\n');
                result.stdout += `${passed_test} out of ${total_tests} passed\n\nexpected: ${expected_out}\ngot: ${res}\n\nfor input\n\n${input_values}`
                fail = true
                break
            }
            passed_test += 1

        }
    }
    
    if (!fail) {
        result.stdout += `${passed_test} out of ${total_tests} passed`
    }

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
