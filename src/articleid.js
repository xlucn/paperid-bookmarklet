/**
 * Support:
 * - Accent in names are converted to non-accented characters
 * - Multi-word last names
 * - Multiple journal publishers
 *
 * TODO:
 * - special characters in names
 *   https://journals.aps.org/prd/abstract/10.1103/PhysRevD.110.064034
 * - trailing CJK names
 *   https://journals.aps.org/prd/abstract/10.1103/PhysRevD.110.083044
 */

class Extractor {
    constructor(doc) {
        this.document = doc;
    }

    extract_meta(names, allow_null=false) {
        for (var i in names) {
            var meta = this.document.querySelector('meta[name="' + names[i] + '"]');
            if (meta) {
                return meta.content;
            }
        }
        if (allow_null) {
            return null;
        } else {
            throw new Error('No meta tag found for: ' + names.join(' or '));
        }
    }

    extract_text(selector, allow_null=false) {
        var elem = this.document.querySelector(selector);
        if (elem) {
            return elem.textContent;
        } else if (allow_null) {
            return null;
        } else {
            throw new Error('No element found for: ' + selector);
        }
    }

    abbrv(abbrv_orig) {
        var words = abbrv_orig.split(',')[0].split(/\s/);
        if (words.length == 1 && words[0].length > 0) {
            return abbrv_orig;
        } else if (words.length == 2) {
            return words[0].slice(0, 3) + words[1].slice(0, 3);
        } else {
            return abbrv_orig.replace(/[a-z.\s]/g, '');
        }
    }

    extract_author() {
        var author_text = this.extract_text('span[class="text surname"]', true);
        if (author_text) {
            return author_text;
        }

        var author_meta = ['citation_author', 'dc.Creator', 'dc.creator'];
        var authorRaw = this.extract_meta(author_meta).split(',')[0];

        if (authorRaw.match(/.*Collaboration/)) {
            return authorRaw.split(/\s/)[0] + 'Col';
        }

        // some author are in the format of 'Last, First',
        // some are in the format of 'First Last'
        var authorLast = authorRaw.split(/\s/).reverse()[0];
        // remove accents
        var author = authorLast.normalize('NFKD')
                               .replace(/[\u0300-\u036f]/g, '')
                               .replace(/ß/g, 'ss');
        return author;
    }

    extract_year() {
        // different meta names for different publishers
        var year = this.extract_text('span[property="datePublished"]', true);
        if (year) {
            return year.split(/\s/).reverse()[0];
        }

        var year_meta = ['citation_date', 'citation_publication_date',
                         'citation_online_date', 'dc.Date']
        var year = this.extract_meta(year_meta).split(/[-/]/)[0];
        return year;
    }

    extract_journal() {
        var journal = this.extract_meta(['citation_journal_title']);
        var abbrv_orig = this.extract_meta(['citation_journal_abbrev'], true);
        if (!abbrv_orig) {
            abbrv_orig = journal;
        }
        var abbrv = this.abbrv(abbrv_orig);
        return abbrv;
    }

    extract_vol() {
        var vol = this.extract_text('span[property="volumeNumber"]', true);
        if (vol) {
            return vol;
        }

        var vol = this.extract_meta(['citation_volume']);
        return vol;
    }

    extract_page() {
        var article_number = this.extract_text(['span[data-test="article-number"]'], true);
        if (article_number) {
            return article_number;
        }

        var page = this.extract_text('span[property="pageStart"]', true);
        if (page) {
            return page;
        }

        var page = this.extract_meta(['citation_firstpage']);
        return page;
    }

    extract() {
        var result = this.extract_author() +
                     this.extract_year() +
                     this.extract_journal() +
                     this.extract_vol() + '.' +
                     this.extract_page();
        return result;
    }
}

function Toast(msg, duration = 5000) {
    const m = document.createElement('div');
    m.innerHTML = msg;
    // set the sizes
    m.style.cssText = 'padding:16px;text-align:center;border-radius:4px;font-size:16px;';
    // center the toast at the center of the page
    m.style.cssText += 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);';
    // set color and make it on the top
    m.style.cssText += 'z-index:999999;color:#fff;background:rgba(0,0,0,0.7);';
    document.body.appendChild(m);
    setTimeout(() => { m.remove(); }, duration);
}

function main(){
    try {
        let result = new Extractor(document).extract();
        navigator.clipboard.writeText(result).then(function() {
            Toast('Copied: ' + result);
        }, function(err) {
            console.error('Failed to copy text: ', err);
        })
    } catch (e) {
        alert(e);  /* probably meta not found */
    }
}

// export { Extractor, main };
