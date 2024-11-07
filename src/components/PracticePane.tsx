import React, { useState } from 'react';
import Editor from '@components/Editor.jsx';

import prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another

const { highlight, languages } = prism;

export default function MyEditor({
    initialCode,
    exId,
    check,
}: {
    check?: boolean;
    exId: string;
    initialCode: string;
}) {
    const [code, setCode] = React.useState(initialCode ?? `// your code here`);
    const [stderr, setStderr] = React.useState('');
    const [stdout, setStdout] = React.useState('');

    type Tabs = 'stdout' | 'stderr';
    const [errKind, setErrKind] = React.useState(undefined);
    const [active, setActive] = useState<Tabs>('stdout');

    function checkCode() {
        const url = check === true ? '/api/compile-check' : '/api/compile';
        fetch(url, {
            method: 'post',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({ code, exId }),
        })
            .then((res) => {
                if (res.ok) {
                    return res.json();
                }
                throw res;
            })
            .then((data) => {
                setStderr(data.stderr ?? '');
                setStdout(data.stdout ?? '');
                setErrKind(data.err_kind);
                if (data.err_kind === 'none') {
                    setActive('stdout');
                } else {
                    setActive('stderr');
                }
            })
            .catch((err) => {
                console.log('The error is:');
                console.dir(err);
                setStderr(err.toString());
            });
    }

    function tabBtnStyle(label: Tabs): React.CSSProperties {
        return {
            padding: '0.7rem',
            background: 'none',
            border: 'none',
            borderBottom: active === label ? '2px solid green' : 'none',
        };
    }

    const bangStyle: React.CSSProperties = {
        margin: '0 0 0 0.6rem',
        display: 'inline-block',
        background: '#d0Ef4B88',
        borderRadius: '50%',
        border: '1px solid #8Ab836',
        color: '#8Ab836',
        width: '1.1rem',
        height: '1.1rem',
        fontWeight: '500',
        boxSizing: 'border-box',
    };

    return (
        <div>
            <div style={{ margin: '0.4rem 0' }}>
                <Editor
                    padding={10}
                    preClassName="codearea"
                    textareaClassName="codearea"
                    tabSize={4}
                    value={code}
                    onValueChange={setCode}
                    highlight={(code: string) => highlight(code, languages.c)}
                />
            </div>
            <button onClick={checkCode}>Submit</button>

            <div>
                <button
                    style={tabBtnStyle('stderr')}
                    onClick={() => setActive('stderr')}
                >
                    stderr
                    {stderr !== '' && <span style={bangStyle}>!</span>}
                </button>
                <button
                    style={tabBtnStyle('stdout')}
                    onClick={() => setActive('stdout')}
                >
                    stdout
                    {stdout !== '' && <span style={bangStyle}>!</span>}
                </button>
            </div>

            <div
                style={{
                    whiteSpace: 'pre-wrap',
                }}
            >
                {active === 'stdout' && <p className="out">{stdout}</p>}
                {active === 'stderr' && <p className="out">{stderr}</p>}
            </div>
        </div>
    );
}
