// @ts-check

import fs from "node:fs/promises";

import child_process from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(child_process.exec);

export async function POST({ request }) {
  const data = await request.json();
  console.dir(data);

  if (data.code !== undefined) {
    const out_name = "user-prg"
    fs.writeFile(`${out_name}.c`, data.code);
    let result = {
      ok: true,
      stderr: "empty",
      stdout: "empty",
      value: "success",
    };


    try {
      const { stdout, stderr } = await exec(
        `cc -o build/c/${out_name} -Wall ${out_name}.c`
      );
      result.stderr = stderr;
      result.stdout = stdout;
    } catch (e) {
        result.stderr = e.stdout;
        return new Response(JSON.stringify({ error: e.stdout }), {
          status: 503,
          headers: {
            "Content-Type": "application/json",
          },
        });
    }

    try {
      const { stdout, stderr } = await exec(`./build/c/${out_name}`);
      if (stderr !== "") {
        result.stderr += stderr;
      }

      result.stdout = stdout
      console.dir(result);

    } catch (e) {
      console.dir(e)
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return new Response(JSON.stringify({ error: "no code provided" }), {
    status: 503,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
