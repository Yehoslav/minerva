// @ts-check

import fs from 'node:fs/promises';

import child_process from 'node:child_process';
import { promisify } from 'node:util';

/** @type {(cmd: string) => Promise<{stdout: string, stderr: string}>} */
const exec = promisify(child_process.exec);

class Path {
    /** @param {string} path */
    constructor(path) {
        try {
            fs.stat(path);
        } catch {
            fs.mkdir(path);
        }
        this.path = path
    }

    /**
     * @param {string} subpath
     * @returns {Path}
     * */
    extend(subpath) {
        if (subpath.at(0) === '/') { return new Path(this.path + subpath); }
        return new Path(this.path + '/' + subpath);
    }

    get str() {
        return this.path
    }
}

/** @type {import("astro").APIRoute} */
export const POST = async ({ request }) => {
    const data = await request.json();
    let result = {
        ok: true,
        stderr: 'empty',
        stdout: 'empty',
        value: 'success',
    };


    const cache_dir = new Path('/tmp/minerva');

    // TODO: Get the session id from cookies, or create one if such doesn't exist
    const temporary_session_id = 'session-id-1234';
    const session_dir = cache_dir.extend(temporary_session_id);


    if (data.code === undefined) {
        return new Response(JSON.stringify({ error: 'no code provided' }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    const code_path = session_dir.extend('code/main.c');
    await fs.writeFile(code_path.str, data.code);

    const out_path = session_dir.extend('bin/main');

    try {
        // TODO: compile using bwrap, so that session id is not exposed in the error messages
        const { stderr, stdout } = await exec(
            `cc -o ${out_path.str} -Wall ${code_path.str}`,
        );
        result.stderr = stderr;
        result.stdout = stdout;
    } catch (err) {
        return new Response(JSON.stringify({ error: err.stdout }), {
            status: 503,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    try {
        const { stdout, stderr } = await exec(out_path.str);
        if (stderr !== '') {
            result.stderr += stderr;
        }

        result.stdout = stdout;
    } catch (e) {
        console.dir(e);
    }

    return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
