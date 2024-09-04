/**
 * Support:
 * Accent in names are converted to non-accented characters
 * Multi-word last names
 * Multiple journal publishers
 *
 * merge in javascript:
 * var a = {...b, ...c}
 */

class Extractor {
    constructor(doc) {
        this.doc = doc;
    }

    extract_meta(name) {
        return this.doc.querySelector('meta[name="' + name + '"]');
    }

    abbrev(journal, abbr) {
        // FIXME: if abbr is not present
        var words = abbr.split(/\s/);
        if (words.length == 1 && words[0].length > 0) {
            return abbr;
        } else if (words.length == 2) {
            return words[0].slice(0, 3) + words[1].slice(0, 3);
        } else {
            return abbr.replace(/[a-z.\s]/g, '');
            // return journal.replace(/[a-z\s]/g, '');
        };
    }

    extract(names, fallback=null) {
        for (var i = 0; i < names.length; i++) {
            var meta = this.extract_meta('citation_' + names[i]);
            if (meta) {
                console.debug('Found meta tag for ' + names[i] + ': ' + meta.content);
                return meta.content;
            };
        };
        if (fallback != null) {
            return fallback;
        } else {
            throw new Error('Can\'t extract article code, no meta tag found' +
                ' for: citation_' + names.join(' or citation_'));
        }
    }

    extract_code() {
        // some author are in the format of 'Last, First',
        // some are in the format of 'First Last'
        var authorRaw = this.extract(['author']).split(',')[0].split(/\s/).reverse()[0];
        // remove accents
        var author = authorRaw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // different meta names for different publishers
        var year = this.extract(['date', 'publication_date', 'online_date']).split('/')[0];
        // var abbrv = extract(['journal_abbrev']).split(' ').map(first).join('');
        var abbrv = this.abbrev(this.extract(['journal_title']), this.extract(['journal_abbrev'], ''));
        var vol = this.extract(['volume']);
        var page = this.extract(['firstpage']);

        var result = author + year + abbrv + vol + '.' + page;
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
        let extractor = new Extractor(document);
        var result = extractor.extract_code();
    } catch (e) {
        /* meta not found */
        alert(e);
    }

    navigator.clipboard.writeText(result).then(function() {
        Toast('Copied: ' + result);
    }, function(err) {
        console.error('Failed to copy text: ', err);
    });
}

export { Extractor, main };
