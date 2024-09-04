"use strict";
import { readFileSync, readdirSync } from 'fs';
import { JSDOM } from 'jsdom';
import { describe } from 'mocha';
import { expect } from 'chai';
import { Extractor } from '../src/articleid.js';

const testGroups = readdirSync('test', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

testGroups.forEach(group => {
    describe(`Test ${group}`, function() {
        const subGroups = readdirSync(`test/${group}`, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

        subGroups.forEach(subGroup => {
            const items = readdirSync(`test/${group}/${subGroup}`)
                .filter(file => file.endsWith('.html'))

            items.forEach(item => {
                it(`should work on ${subGroup}/${item}`, function() {
                    // the answer is in the filename
                    const expected = item.slice(0, -5);
                    const data = readFileSync(`test/${group}/${subGroup}/${item}`);

                    // Create a JSDOM instance
                    let dom = new JSDOM(data);
                    // Get the document
                    let document = dom.window.document;
                    // Create an Extractor instance
                    let extractor = new Extractor(document);
                    // Extract the article code
                    let result = extractor.extract_code();

                    // Check the result
                    expect(result).to.equal(expected);
                });
            });
        });
    });
})
