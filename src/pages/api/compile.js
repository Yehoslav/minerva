// @ts-check

import fs from 'node:fs';

import child_process from 'node:child_process';
import { promisify } from 'node:util';

import crypto from "node:crypto"

/** @type {(cmd: string) => Promise<{stdout: string, stderr: string, error: string}>} */
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

/** @type {import("astro").APIRoute} */
export const POST = async ({ request, cookies }) => {
    const data = await request.json();

    const id = crypto.randomBytes(16).toString("hex")
    if (!cookies.has('session-id'))
    cookies.set('session-id', id, {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
    })

    /** @type {Response} */
    let result = {
        err_kind: 'none',
        stderr: '',
        stdout: '',
        error:  '',
    };

    const cache_dir = new Path('/tmp/minerva');

    // TODO: Get the session id from cookies, or create one if such doesn't exist
    const temporary_session_id = cookies.get('session-id')?.value;
    if (temporary_session_id === undefined) {
        throw new Error("Session id is undefined")
    }
    const session_dir = cache_dir.extend_dir(temporary_session_id);

    let code = ""
    if (data.code === undefined) {
        return new Response(JSON.stringify({ error: 'no code provided' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    code = data.code

    console.log("exId:", data.exId)
    if (data.exId === undefined) {
        return new Response(JSON.stringify({ error: 'no exId provided' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const matches = import.meta.glob('/src/content/c-intro/*.mdx', {
        eager: true,
    });


    const lesson = matches[`/src/content/${data.exId}.mdx`];
    if (lesson === undefined) {
        return new Response(JSON.stringify({ stderr: "could not find exercise", err_kind: "compiletime" }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    let expected_out = undefined
    if (lesson?.exercises.at(0).test_data !== undefined) {
        const input_data = lesson?.exercises.at(0).test_data.at(0).input_data
        const include = Object.keys(input_data).map(k => `#define ${k} ${input_data[k]}`).join("\n")
        code = include + "\n\n" + code
        expected_out = lesson?.exercises.at(0).test_data.at(0).expected_output
    }
    console.log(expected_out)

    const code_name = "main.c";
    const code_dir = session_dir.extend_dir('code');
    const code_path = code_dir.extend_file(code_name);
    fs.writeFileSync(code_path.str, code);

    const out_name = 'a.out';
    const out_dir = session_dir.extend_dir('bin');
    const out_path = out_dir.extend_file(out_name);

    try {
        if (!fs.existsSync("/nix/store")) {
            throw new Error("The system is not NixOS, update the paths for bwrap!!!")
        }
        const { stdout, stderr, error } = await exec(
            `bwrap --unshare-all --ro-bind /nix/store /nix/store --ro-bind ${code_dir.str} /src --bind ${out_dir.str} /bin cc -o /bin/${out_name} -Wall /src/${code_name}`
        );
        console.log('stdout:', stdout, '\nstderr:', stderr, '\nerror:', error)
        result.stderr += stderr;
        result.stdout += stdout;
    } catch (err) {
        if (err !== null && err !== undefined && err.hasOwnProperty('stderr')) {
            return new Response(JSON.stringify({ stderr: err.stderr, err_kind: "compiletime" }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    }

    try {
        const { stdout, stderr, error } = await exec(`bwrap --unshare-all --ro-bind /nix/store /nix/store --ro-bind ${out_dir.str} /bin /bin/${out_name}`);
        if (stderr !== '') {
            result.err_kind = 'runtime';
            result.stderr += stderr;
        }

        if (expected_out === undefined) {
            result.stdout = stdout
        } else if (stdout !== expected_out) {
            result.stdout = `test failed:\nexpected output: ${expected_out}\nstdout: ${stdout}`;
        } else {
           result.stdout  = "1 of 1 tests succesfull"
        }
    } catch (e) {
        result.err_kind = 'runtime';
        result.stderr += e.stderr;
        console.dir(e);
    }

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
