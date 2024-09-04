// CommonJS import
import { readFile, readdirSync } from 'fs';
import { JSDOM } from 'jsdom';
import { describe } from 'mocha';
import { expect } from 'chai';
import { Extractor } from '../src/articleid.js';

const testGroups = [
    {
        pub: 'springer',
        jour: [
            { name: 'CMDA', expected: 'Gaitanas2024CMDA136.1' },
        ]
    }
]

// glob all subfolders
testGroups.forEach(({ pub, jour }) => {
    describe(`Test ${pub}`+ pub, function() {
        jour.forEach(({ name, expected }) => {
            it(`should work on ${pub}/${name}`, function() {
                readFile(`test/${pub}/${name}.html`, 'utf8', (err, data) => {
                    if (err) throw err;

                    // Create a JSDOM instance
                    const dom = new JSDOM(data);

                    // Get the document
                    const document = dom.window.document;

                    // Create an Extractor instance
                    let extractor = new Extractor(document);
                    var result = extractor.extract_code();

                    // Check the result
                    expect(result).to.equal(expected);
                });
            });
        });
    });
})
