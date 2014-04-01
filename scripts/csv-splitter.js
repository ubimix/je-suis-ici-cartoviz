function CsvSplitter(options) {
    options = options || {};
    this._delim = options.delim || ';';
    this._quot = options.quot || '"';
    this._esc = options.esc || '\\';
}

CsvSplitter.prototype.toObject = function(fields, cells) {
    if (typeof cells == 'string') {
        cells = this.splitCsvLine(cells);
    }
    var obj = {};
    for (var i = 0; i < cells.length; i++) {
        obj[fields[i]] = cells[i];
    }
    return obj;
}

CsvSplitter.prototype.splitCsvLine = function(str) {
    var result = [];
    var esc = false;
    var quot = null;
    var buf = '';
    var newCell = true;
    function end() {
        // if (!newCell) {
        result.push(buf);
        // }
        buf = '';
        quot = null;
    }
    var i;
    for (i = 0; i < str.length; i++) {
        var ch = str[i];
        if (esc) {
            buf += ch;
            esc = false;
        } else {
            if (ch == this._esc) {
                esc = true;
            } else {
                if (quot) {
                    if (ch == this._quot) {
                        // Double quots in already quoted text.
                        if (str[i + 1] == this._quot)
                            esc = true;
                        else
                            quot = null;
                    } else {
                        buf += ch;
                    }
                } else {
                    if (ch == this._quot) {
                        quot = ch;
                    } else if (ch == this._delim) {
                        end();
                        newCell = true;
                    } else {
                        buf += ch;
                    }
                }
            }
        }
        newCell = false;
    }
    end();
    return result;
}

module.exports = CsvSplitter;
