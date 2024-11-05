// @ts-check

import fs from 'node:fs/promises';

import child_process from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(child_process.exec);

export async function POST({ request }) {
    const data = await request.json();
    console.dir(data);

    if (data.code !== undefined) {
        fs.writeFile('code.c', data.code);
        let result = {
            ok: true,
            stderr: 'empty',
            stdout: 'empty',
            value: 'success',
        };

        {
            const { stdout, stderr } = await exec(
                'cc -o build/c/add -Wall main.c code.c',
            );
            result.stderr = stderr;
            result.stdout = stdout;
        }

        let testData = [
            [2, 2],
            [-2, 3],
            [2, -3],
        ];

        for (let pair of testData) {
            const { stdout, stderr } = await exec(
                `./build/c/add ${pair[0]} ${pair[1]}`,
            );

            if (stderr !== '') {
                result.stderr += stderr;
                break;
            }
            result.stdout += `add(${pair[0]}, ${pair[1]}) => ${stdout}`;
            if (parseInt(stdout) !== pair[0] + pair[1]) {
                result.stdout += `, expected ${pair[0] + pair[1]}`;
            }
            result.stdout += '\n';
        }

        console.dir(result);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify({ error: 'no code provided' }), {
        status: 503,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
