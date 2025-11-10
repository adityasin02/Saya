/**
 * @license
 * jsmediatags
 * Copyright (c) 2018 António Afonso
 * https://github.com/aadsm/jsmediatags
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,

 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.jsmediatags = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const XhrFileReader = require('./XhrFileReader');
const ArrayFileReader = require('./ArrayFileReader');

function getFileReader(file) {
  if (typeof file === 'string') {
    return XhrFileReader;
  } else if (typeof file === 'object') {
    if (file instanceof Array) {
      return ArrayFileReader;
    } else {
      return file.constructor;
    }
  } else {
    throw new Error('No FileReader found for type ' + typeof file);
  }
}

module.exports = {
  getFileReader: getFileReader
};

},{"./ArrayFileReader":2,"./XhrFileReader":6}],2:[function(require,module,exports){
'use strict';
const MediaFileReader = require('./MediaFileReader');

class ArrayFileReader extends MediaFileReader {
  constructor(array) {
    super();
    this._array = array;
    this._size = array.length;
    this._isInitialized = false;
  }

  init(callbacks) {
    this._isInitialized = true;
    setTimeout(callbacks.onSuccess, 0);
  }

  loadRange(range, callbacks) {
    if (!this._isInitialized) {
      this.init({
        onSuccess: () => this.loadRange(range, callbacks)
      });
      return;
    }
    setTimeout(callbacks.onSuccess, 0);
  }

  getByteAt(offset) {
    if (offset >= this._array.length) {
      throw new Error("Offset " + offset + " hasn't been loaded yet.");
    }
    return this._array[offset];
  }
}

module.exports = ArrayFileReader;
},{"./MediaFileReader":3}],3:[function(require,module,exports){
'use strict';

class MediaFileReader {
  constructor() {
    this._isInitialized = false;
    this._size = 0;
  }

  init(callbacks) {
    throw new Error("init not implemented");
  }

  loadRange(range, callbacks) {
    throw new Error("loadRange not implemented");
  }

  getSize() {
    if (!this._isInitialized) {
      throw new Error("Cannot create blobs until init() has been called.");
    }
    return this._size;
  }

  getByteAt(offset) {
    throw new Error("getByteAt not implemented");
  }

  getBytesAt(offset, length) {
    const bytes = new Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = this.getByteAt(offset + i);
    }
    return bytes;
  }

  isBitSetAt(offset, bit) {
    const iByte = this.getByteAt(offset);
    return (iByte & 1 << bit) != 0;
  }

  getSByteAt(offset) {
    const iByte = this.getByteAt(offset);
    if (iByte > 127) {
      return iByte - 256;
    } else {
      return iByte;
    }
  }

  getShortAt(offset, isBigEndian) {
    const iShort = isBigEndian ? (this.getByteAt(offset) << 8) + this.getByteAt(offset + 1) : (this.getByteAt(offset + 1) << 8) + this.getByteAt(offset);
    if (iShort < 0) {
      return iShort + 65536;
    } else {
      return iShort;
    }
  }

  getSShortAt(offset, isBigEndian) {
    let iShort = this.getShortAt(offset, isBigEndian);
    if (iShort > 32767) {
      return iShort - 65536;
    } else {
      return iShort;
    }
  }

  getLongAt(offset, isBigEndian) {
    const iByte1 = this.getByteAt(offset),
      iByte2 = this.getByteAt(offset + 1),
      iByte3 = this.getByteAt(offset + 2),
      iByte4 = this.getByteAt(offset + 3);

    const iLong = isBigEndian ? (((iByte1 << 8) + iByte2 << 8) + iByte3 << 8) + iByte4 : (((iByte4 << 8) + iByte3 << 8) + iByte2 << 8) + iByte1;

    if (iLong < 0) {
      return iLong + 4294967296;
    } else {
      return iLong;
    }
  }

  getSLongAt(offset, isBigEndian) {
    let iLong = this.getLongAt(offset, isBigEndian);
    if (iLong > 2147483647) {
      return iLong - 4294967296;
    } else {
      return iLong;
    }
  }

  getInteger24At(offset, isBigEndian) {
    const iByte1 = this.getByteAt(offset),
      iByte2 = this.getByteAt(offset + 1),
      iByte3 = this.getByteAt(offset + 2);

    const iInteger = isBigEndian ? ((iByte1 << 8) + iByte2 << 8) + iByte3 : ((iByte3 << 8) + iByte2 << 8) + iByte1;

    if (iInteger < 0) {
      return iInteger + 16777216;
    } else {
      return iInteger;
    }
  }

  getStringAt(offset, length) {
    const string = [];
    for (let i = offset, j = 0; i < offset + length; i++, j++) {
      string[j] = String.fromCharCode(this.getByteAt(i));
    }
    return string.join("");
  }

  getStringWithCharsetAt(offset, length, charset) {
    const bytes = this.getBytesAt(offset, length);
    let string;

    switch (charset.toLowerCase()) {
      case "utf-16":
      case "utf-16le":
      case "utf-16be":
        string = new (require('./StringUtils').StringUtils)(bytes, charset).toString();
        break;

      case "utf-8":
        string = this.getStringAt(offset, length);
        break;

      default:
        string = this.getStringAt(offset, length);
        break;
    }

    return string;
  }

  getSynchsafeInteger32At(offset) {
    const size1 = this.getByteAt(offset);
    const size2 = this.getByteAt(offset + 1);
    const size3 = this.getByteAt(offset + 2);
    const size4 = this.getByteAt(offset + 3);

    return (size1 & 0x7f) << 21 | (size2 & 0x7f) << 14 | (size3 & 0x7f) << 7 | size4 & 0x7f;
  }
}

module.exports = MediaFileReader;

},{"./StringUtils":5}],4:[function(require,module,exports){
'use strict';
const MediaFileReader = require('./MediaFileReader');
const ChunkedFileData = require('./ChunkedFileData');

const CHUNK_SIZE = 1024;

class MediaTagReader extends MediaFileReader {
  constructor(mediaFileReader) {
    super();
    this._mediaFileReader = mediaFileReader;
    this._tags = null;
  }

  _loadData(callbacks, options) {
    const self = this;
    this._mediaFileReader.init({
      onSuccess: function() {
        self._loadDataWithFileReader(callbacks, options);
      },
      onError: callbacks.onError
    });
  }

  _loadDataWithFileReader(callbacks, options) {
    throw new Error("Must implement _loadDataWithFileReader()");
  }

  getTags() {
    return this._tags;
  }

  setTags(tags) {
    this._tags = tags;
    return this;
  }
}

module.exports = MediaTagReader;

},{"./ChunkedFileData":7,"./MediaFileReader":3}],5:[function(require,module,exports){
'use strict';
const StringUtils = {
  readUTF16String: function(bytes, bigEndian, maxBytes) {
    let ix = 0;
    let offset = 0;
    let b1, b2;

    if (bytes[0] == 0xFE && bytes[1] == 0xFF) {
      bigEndian = true;
      offset = 2;
    } else if (bytes[0] == 0xFF && bytes[1] == 0xFE) {
      bigEndian = false;
      offset = 2;
    }
    
    maxBytes = Math.min(maxBytes || bytes.length, bytes.length);

    let arr = [];
    for( let i = offset; i < maxBytes; i+=2 ) {
        b1 = bytes[i];
        b2 = bytes[i+1];
        if (bigEndian) {
            arr.push(String.fromCharCode((b1 << 8) | b2));
        } else {
            arr.push(String.fromCharCode((b2 << 8) | b1));
        }
    }
    return arr.join('');
  },

  readUTF8String: function(bytes, maxBytes) {
      let ix = 0;
      let offset = 0;
      
      if (bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF) {
          offset = 3;
      }
      
      maxBytes = Math.min(maxBytes || bytes.length, bytes.length);

      let arr = [];
      for( let i = offset; i < maxBytes; i++ ) {
          arr.push(String.fromCharCode(bytes[i]));
      }
      return arr.join('');
  }
};

module.exports = StringUtils;

},{}],6:[function(require,module,exports){
'use strict';
const MediaFileReader = require('./MediaFileReader');
const ChunkedFileData = require('./ChunkedFileData');

class XhrFileReader extends MediaFileReader {
  constructor(url) {
    super();
    this._url = url;
    this._isInitialized = false;
    this._size = 0;
    this._fileData = new ChunkedFileData();
  }

  init(callbacks) {
    if (this._isInitialized) {
      setTimeout(callbacks.onSuccess, 0);
      return;
    }

    const self = this;
    this._makeRequest("HEAD", {
      onSuccess: function(xhr) {
        let size = self._getSize(xhr);
        if (size === -1) {
          self._fetchEntireFile(callbacks);
        } else {
          self._size = size;
          self._isInitialized = true;
          callbacks.onSuccess();
        }
      },
      onError: callbacks.onError
    });
  }

  _fetchEntireFile(callbacks) {
    const self = this;
    this._makeRequest("GET", {
      onSuccess: function(xhr) {
        const response = xhr.response;
        if (response) {
          self._size = response.length;
          self._fileData.addData(0, response);
          self._isInitialized = true;
          callbacks.onSuccess();
        } else {
          callbacks.onError({
            "type": "xhr",
            "info": "missing response"
          });
        }
      },
      onError: callbacks.onError
    });
  }

  _getSize(xhr) {
    const contentLength = xhr.getResponseHeader("Content-Length");
    if (contentLength) {
      return parseInt(contentLength, 10);
    }
    return -1;
  }

  loadRange(range, callbacks) {
    const self = this;

    if (self._fileData.hasDataRange(range[0], range[1])) {
      setTimeout(callbacks.onSuccess, 0);
      return;
    }

    this._makeRequest("GET", {
      onSuccess: function(xhr) {
        const response = xhr.response;
        if (response) {
          self._fileData.addData(range[0], response);
          callbacks.onSuccess();
        } else {
          callbacks.onError({
            "type": "xhr",
            "info": "missing response"
          });
        }
      },
      onError: callbacks.onError
    }, {
      "Range": "bytes=" + range[0] + "-" + range[1]
    });
  }

  getByteAt(offset) {
    return this._fileData.getByteAt(offset);
  }

  _makeRequest(method, callbacks, headers) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, this._url, true);
    xhr.overrideMimeType("text/plain; charset=x-user-defined");

    if (headers) {
      for (let header in headers) {
        if (headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }
    }

    xhr.onload = function(event) {
      if (xhr.status === 200 || xhr.status === 206) {
        callbacks.onSuccess(xhr);
      } else {
        if (callbacks.onError) {
          callbacks.onError({
            "type": "xhr",
            "info": "Unexpected HTTP status " + xhr.status,
            "xhr": xhr
          });
        }
      }
    };

    if (callbacks.onError) {
      xhr.onerror = function(event) {
        callbacks.onError({
          "type": "xhr",
          "info": "Generic XHR error",
          "xhr": xhr
        });
      };
    }

    xhr.send(null);
  }
}

module.exports = XhrFileReader;
},{"./ChunkedFileData":7,"./MediaFileReader":3}],7:[function(require,module,exports){
'use strict';

class ChunkedFileData {
  constructor() {
    this._fileData = [];
    this._sparse = false;
  }

  addData(offset, data) {
    const dataOffset = this._getChunkRange(offset, data.length);
    const dataEnd = offset + data.length - 1;
    const chunkStart = dataOffset.start;
    const chunkEnd = dataOffset.end;
    const newChunk = {};

    newChunk.offset = offset;
    newChunk.data = data;

    if (this._sparse) {
      this._fileData.splice(chunkStart, chunkEnd - chunkStart + 1, newChunk);
    } else {
      if (chunkEnd < 0) { // empty
        this._fileData.push(newChunk);
      } else {
        const firstChunk = this._fileData[chunkStart];
        if (offset < firstChunk.offset) {
          firstChunk.offset = offset;
          firstChunk.data = data + firstChunk.data;
        } else {
          firstChunk.data += data;
        }
      }
    }
  }

  _getChunkRange(offset, length) {
    let start = -1,
      end = -1;
    for (let i = 0; i < this._fileData.length; i++) {
      const chunk = this._fileData[i];
      if (this._between(offset, chunk.offset, chunk.offset + chunk.data.length)) {
        start = i;
      }
      if (this._between(offset + length - 1, chunk.offset, chunk.offset + chunk.data.length)) {
        end = i;
      }
    }
    if (start === -1 && end === -1 && this._fileData.length > 0 && offset < this._fileData[0].offset) {
      start = end = 0;
    }
    return {
      start: start,
      end: end
    };
  }

  _between(value, first, last) {
    return value >= first && value <= last;
  }

  hasDataRange(offset, length) {
    for (let i = 0; i < this._fileData.length; i++) {
      const chunk = this._fileData[i];
      if (offset >= chunk.offset && offset + length <= chunk.offset + chunk.data.length) {
        return true;
      }
    }
    return false;
  }

  getByteAt(offset) {
    for (let i = 0; i < this._fileData.length; i++) {
      const chunk = this._fileData[i];
      if (offset >= chunk.offset && offset < chunk.offset + chunk.data.length) {
        return chunk.data.charCodeAt(offset - chunk.offset) & 0xFF;
      }
    }
    throw new Error("Offset " + offset + " not loaded.");
  }
}

module.exports = ChunkedFileData;

},{}],8:[function(require,module,exports){
'use strict';
const MediaTagReader = require('./MediaTagReader');
const MediaFileReader = require('./MediaFileReader');
const ID3v1 = require('./ID3v1TagReader');
const ID3v2 = require('./ID3v2TagReader');

class ID3Reader extends MediaTagReader {
  constructor(mediaFileReader) {
    super(mediaFileReader);
    this._id3v1 = new ID3v1(mediaFileReader);
    this._id3v2 = new ID3v2(mediaFileReader);
  }

  _loadData(callbacks, options) {
    const self = this;
    this._mediaFileReader.init({
      onSuccess: function() {
        self._loadDataWithFileReader(callbacks, options);
      },
      onError: callbacks.onError
    });
  }

  _loadDataWithFileReader(callbacks, options) {
    const self = this;
    const readers = [];
    if (!options || !options.tags || options.tags.indexOf("id3v2") !== -1) {
      readers.push(this._id3v2);
    }
    if (!options || !options.tags || options.tags.indexOf("id3v1") !== -1) {
      readers.push(this._id3v1);
    }

    const tags = {};

    function read(i) {
      if (i >= readers.length) {
        self.setTags(tags);
        callbacks.onSuccess();
        return;
      }
      readers[i]._loadData({
        onSuccess: function() {
          const readerTags = readers[i].getTags();
          for (let key in readerTags) {
            if (readerTags.hasOwnProperty(key)) {
              tags[key] = readerTags[key];
            }
          }
          read(i + 1);
        },
        onError: callbacks.onError
      }, options);
    }

    read(0);
  }

  getTags() {
    return this._tags || {};
  }
}

module.exports = ID3Reader;
},{"./ID3v1TagReader":9,"./ID3v2TagReader":10,"./MediaFileReader":3,"./MediaTagReader":4}],9:[function(require,module,exports){
'use strict';
const MediaTagReader = require('./MediaTagReader');

const ID3v1_GENRES = [
  "Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge",
  "Hip-Hop", "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B",
  "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska",
  "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient",
  "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance", "Classical",
  "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel",
  "Noise", "AlternRock", "Bass", "Soul", "Punk", "Space", "Meditative",
  "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic",
  "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk",
  "Eurodance", "Dream", "Southern Rock", "Comedy", "Cult", "Gangsta",
  "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American",
  "Cabaret", "New Wave", "Psychadelic", "Rave", "Showtunes", "Trailer",
  "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro",
  "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk-Rock",
  "National Folk", "Swing", "Fast Fusion", "Bebob", "Latin", "Revival",
  "Celtic", "Bluegrass", "Avantgarde", "Gothic Rock", "Progressive Rock",
  "Psychedelic Rock", "Symphonic Rock", "Slow Rock", "Big Band",
  "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech", "Chanson",
  "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus",
  "Porn Groove", "Satire", "Slow Jam", "Club", "Tango", "Samba",
  "Folklore", "Ballad", "Power Ballad", "Rhythmic Soul", "Freestyle",

  "Duet", "Punk Rock", "Drum Solo", "Acapella", "Euro-House", "Dance Hall"
];

class ID3v1TagReader extends MediaTagReader {
  constructor(mediaFileReader) {
    super(mediaFileReader);
  }

  _loadData(callbacks, options) {
    const fileSize = this._mediaFileReader.getSize();
    this._mediaFileReader.loadRange([fileSize - 128, fileSize - 1], {
      onSuccess: () => {
        this._parseData(this._mediaFileReader, callbacks);
      },
      onError: callbacks.onError
    });
  }

  _parseData(data, callbacks) {
    const offset = data.getSize() - 128;
    const header = data.getStringAt(offset, 3);
    if (header === "TAG") {
      const title = data.getStringAt(offset + 3, 30).replace(/\0/g, "");
      const artist = data.getStringAt(offset + 33, 30).replace(/\0/g, "");
      const album = data.getStringAt(offset + 63, 30).replace(/\0/g, "");
      const year = data.getStringAt(offset + 93, 4).replace(/\0/g, "");

      const trackFlag = data.getByteAt(offset + 97 + 28);
      let track = data.getByteAt(offset + 97 + 29);
      
      let comment, version;

      if( trackFlag === 0 && track !== 0 ) {
        version = 1.1;
        comment = data.getStringAt(offset + 97, 28).replace(/\0/g, "");
      } else {
        version = 1.0;
        comment = data.getStringAt(offset + 97, 30).replace(/\0/g, "");
        track = 0;
      }
      
      const genre = data.getByteAt(offset + 97 + 30);

      const tags = {
        "type": "ID3",
        "version": version,
        "tags": {
          "title": title,
          "artist": artist,
          "album": album,
          "year": year,
          "comment": comment
        }
      };
      
      if(track !== 0) {
        tags.tags.track = track;
      }

      if (genre < ID3v1_GENRES.length) {
        tags.tags.genre = ID3v1_GENRES[genre];
      }

      this.setTags(tags);
    }
    callbacks.onSuccess();
  }
}

module.exports = ID3v1TagReader;
},{"./MediaTagReader":4}],10:[function(require,module,exports){
'use strict';
const MediaTagReader = require('./MediaTagReader');
const ID3v2FrameReader = require('./ID3v2FrameReader');

class ID3v2TagReader extends MediaTagReader {
  constructor(mediaFileReader) {
    super(mediaFileReader);
  }

  _loadData(callbacks, options) {
    const self = this;
    this._mediaFileReader.loadRange([0, ID3v2FrameReader.getFrameHeaderSize() - 1], {
      onSuccess: function() {
        self._parseData(self._mediaFileReader, callbacks);
      },
      onError: callbacks.onError
    });
  }

  _parseData(data, callbacks) {
    let offset = 0;
    const major = data.getByteAt(offset + 3);

    if (major > 4) {
      callbacks.onSuccess();
      return;
    }

    const revision = data.getByteAt(offset + 4);
    const flags = data.getByteAt(offset + 5);
    const unsynchronisation = (flags & 0x80) !== 0;
    const extendedHeader = (flags & 0x40) !== 0;
    const experimental = (flags & 0x20) !== 0;
    let size = data.getSynchsafeInteger32At(offset + 6);
    
    offset += 10;
    
    if (extendedHeader) {
      const extendedHeaderSize = data.getLongAt(offset, true);
      offset += extendedHeaderSize + 4;
    }

    const frameReader = new ID3v2FrameReader(major);
    
    frameReader.readFrames(offset, size, data, {}, {
        onSuccess: () => {
            const tags = frameReader.getTags();
            if(Object.keys(tags).length > 0) {
              this.setTags({
                type: "ID3",
                version: "2." + major + "." + revision,
                tags: tags
              });
            }
            callbacks.onSuccess();
        },
        onError: callbacks.onError
    });
  }
}

module.exports = ID3v2TagReader;
},{"./ID3v2FrameReader":11,"./MediaTagReader":4}],11:[function(require,module,exports){
'use strict';
const StringUtils = require('./StringUtils');
const TAPE = "TAPE",
      TRK = "TRK",
      TORY = "TORY",
      TYER = "TYER",
      TDAT = "TDAT",
      TRCK = "TRCK",
      TALB = "TALB",
      TPE1 = "TPE1",
      TPE2 = "TPE2",
      TCOM = "TCOM",
      TCON = "TCON",
      TIT2 = "TIT2",
      TLEN = "TLEN",
      USLT = "USLT",
      TXXX = "TXXX",
      WXXX = "WXXX",
      COMM = "COMM",
      APIC = "APIC",
      PIC = "PIC";

const FRAME_DESCRIPTIONS = {
  "TALB": "album",
  "TPE1": "artist",
  "TPE2": "band",
  "TCOM": "composer",
  "TCON": "genre",
  "TIT2": "title",
  "TLEN": "length",
  "TORY": "original_release_year",
  "TRCK": "track",
  "TYER": "year",
  "USLT": "lyrics",
  "COMM": "comment",
  "APIC": "picture"
};

class ID3v2FrameReader {
  constructor(major) {
    this._major = major;
    this._tags = {};
  }
  
  getTags() {
    return this._tags;
  }
  
  readFrames(offset, end, data, id3header, callbacks) {
    const self = this;
    const frameHeaderSize = ID3v2FrameReader.getFrameHeaderSize(this._major);

    const readFrame = function() {
        if (offset >= end) {
            callbacks.onSuccess();
            return;
        }

        data.loadRange([offset, offset + frameHeaderSize - 1], {
            onSuccess: function() {
                const frameId = self._readFrameId(data, offset);
                if (!frameId) {
                    callbacks.onSuccess();
                    return;
                }
                const frameSize = self._readFrameSize(data, offset);
                const frameFlags = self._readFrameFlags(data, offset);

                data.loadRange([offset + frameHeaderSize, offset + frameHeaderSize + frameSize - 1], {
                    onSuccess: function() {
                        const frameData = self._readFrameData(data, offset, frameSize, frameFlags);
                        if (frameData) {
                            self._tags[frameId] = frameData;
                        }
                        offset += frameHeaderSize + frameSize;
                        readFrame();
                    },
                    onError: callbacks.onError
                });
            },
            onError: callbacks.onError
        });
    };
    
    readFrame();
  }

  _readFrameId(data, offset) {
    const frameIdSize = this._major === 2 ? 3 : 4;
    return data.getStringAt(offset, frameIdSize);
  }

  _readFrameSize(data, offset) {
    let frameSize;
    if (this._major === 2) {
      frameSize = data.getInteger24At(offset + 3, true);
    } else if (this._major === 3) {
      frameSize = data.getLongAt(offset + 4, true);
    } else { // 4
      frameSize = data.getSynchsafeInteger32At(offset + 4);
    }
    return frameSize;
  }

  _readFrameFlags(data, offset) {
    if (this._major > 2) {
      return {
        tag_alter_preservation: (data.getByteAt(offset + 8) & 0x40) !== 0,
        file_alter_preservation: (data.getByteAt(offset + 8) & 0x20) !== 0,
        read_only: (data.getByteAt(offset + 8) & 0x10) !== 0,
        grouping_identity: (data.getByteAt(offset + 9) & 0x40) !== 0,
        compression: (data.getByteAt(offset + 9) & 0x08) !== 0,
        encryption: (data.getByteAt(offset + 9) & 0x04) !== 0,
        unsynchronisation: (data.getByteAt(offset + 9) & 0x02) !== 0,
        data_length_indicator: (data.getByteAt(offset + 9) & 0x01) !== 0,
      };
    }
  }
  
  _readFrameData(data, offset, size, flags) {
    const frameHeaderSize = ID3v2FrameReader.getFrameHeaderSize(this._major);
    offset += frameHeaderSize;
    
    const frameId = this._readFrameId(data, offset - frameHeaderSize);
    let frameData = {};
    if (FRAME_DESCRIPTIONS[frameId]) {
      frameData.id = FRAME_DESCRIPTIONS[frameId];
    }
    
    if( flags && flags.unsynchronisation ) {
        // TODO: handle unsynchronisation
    }
    if( flags && flags.compression ) {
        // TODO: handle compression
    }
    
    const charset = data.getByteAt(offset);
    
    switch(frameId) {
        case "TRCK":
            frameData.data = data.getStringWithCharsetAt(offset+1, size-1).toString();
            break;
            
        case "TPE1":
        case "TPE2":
        case "TCOM":
        case "TCON":
        case "TALB":
        case "TIT2":
            frameData.data = data.getStringWithCharsetAt(offset+1, size-1).toString();
            break;

        case "APIC":
            const pic = this._readPictureFrame(data, offset);
            frameData.data = pic;
            break;

        case "USLT":
        case "COMM":
            const comm = this._readCommentFrame(data, offset, size);
            frameData.data = comm;
            break;

        case "TXXX":
            const txxx = this._readTextFrame(data, offset, size);
            this._tags[txxx.description] = txxx.value;
            break;
    }
    
    if (Object.keys(frameData).length > 0) {
        return frameData;
    }
  }

  _readTextFrame(data, offset, size) {
    const charset = data.getByteAt(offset);
    offset++; size--;
    
    const descEnd = this._findZero(data, offset, size, charset);
    
    return {
        description: data.getStringWithCharsetAt(offset, descEnd - offset, charset),
        value: data.getStringWithCharsetAt(descEnd+1, size - (descEnd-offset) - 1, charset)
    };
  }

  _readCommentFrame(data, offset, size) {
    const charset = data.getByteAt(offset);
    offset++; size--;

    const language = data.getStringAt(offset, 3);
    offset += 3; size -= 3;
    
    const descEnd = this._findZero(data, offset, size, charset);

    return {
        language: language,
        short_description: data.getStringWithCharsetAt(offset, descEnd - offset, charset),
        text: data.getStringWithCharsetAt(descEnd + 1, size - (descEnd-offset) -1, charset)
    };
  }
  
  _findZero(data, offset, size, charset) {
    let descEnd = offset;
    while(data.getByteAt(descEnd) !== 0x00 && descEnd < offset + size) {
        descEnd++;
    }
    return descEnd;
  }
  
  _readPictureFrame(data, offset) {
    const charset = data.getByteAt(offset);
    offset++;
    let mimeType;
    if (this._major === 2) {
      mimeType = data.getStringAt(offset, 3);
      offset += 3;
    } else {
      const mimeEnd = this._findZero(data, offset, data.getSize() - offset, 'iso-8859-1');
      mimeType = data.getStringAt(offset, mimeEnd - offset);
      offset = mimeEnd + 1;
    }
    const picType = data.getByteAt(offset);
    offset++;

    const descEnd = this._findZero(data, offset, data.getSize() - offset, charset);
    const description = data.getStringWithCharsetAt(offset, descEnd - offset, charset);
    offset = descEnd + 1;

    return {
      format: mimeType.toString(),
      type: ID3v2FrameReader.getPictureType(picType),
      description: description,
      data: data.getBytesAt(offset, (data.getSize() - offset))
    };
  }

  static getFrameHeaderSize(major) {
    if (major === 2) {
      return 6;
    } else if (major === 3 || major === 4) {
      return 10;
    } else {
      return 0;
    }
  }
  
  static getPictureType(picType) {
    return [
      "Other",
      "32x32 pixels 'file icon' (PNG only)",
      "Other file icon",
      "Cover (front)",
      "Cover (back)",
      "Leaflet page",
      "Media (e.g. label side of CD)",
      "Lead artist/lead performer/soloist",
      "Artist/performer",
      "Conductor",
      "Band/Orchestra",
      "Composer",
      "Lyricist/text writer",
      "Recording Location",
      "During recording",
      "During performance",
      "Movie/video screen capture",
      "A bright coloured fish",
      "Illustration",
      "Band/artist logotype",
      "Publisher/Studio logotype"
    ][picType];
  }
}

module.exports = ID3v2FrameReader;

},{"./StringUtils":5}],12:[function(require,module,exports){
'use strict';
const MediaTagReader = require('./MediaTagReader');

class MP4TagReader extends MediaTagReader {
  constructor(mediaFileReader) {
    super(mediaFileReader);
  }

  _loadData(callbacks, options) {
    this._mediaFileReader.loadRange([0, 7], {
      onSuccess: () => {
        this._loadAtom(this._mediaFileReader, 0, "", callbacks);
      },
      onError: callbacks.onError
    });
  }

  _loadAtom(data, offset, parent, callbacks) {
    if (offset >= data.getSize()) {
      callbacks.onSuccess();
      return;
    }

    const self = this;
    const atomSize = data.getLongAt(offset, true);
    if (atomSize === 0) {
      callbacks.onSuccess();
      return;
    }
    const atomName = data.getStringAt(offset + 4, 4);

    if (this._isParentAtom(atomName)) {
      if (atomName === "meta") {
        offset += 4;
      }
      this._loadAtom(data, offset + 8, parent + atomName + ".", callbacks);
    } else {
      data.loadRange([offset + 8, offset + atomSize - 1], {
        onSuccess: function() {
          const tags = self._parseAtom(data, atomName, offset, atomSize);
          if (tags) {
            self.setTags(tags);
          }
          self._loadAtom(data, offset + atomSize, parent, callbacks);
        },
        onError: callbacks.onError
      });
    }
  }

  _isParentAtom(atomName) {
    return ["moov", "udta", "meta", "ilst"].indexOf(atomName) !== -1;
  }

  _parseAtom(data, atomName, offset, atomSize) {
    const atomHeaderSize = 8;
    const atomDataSize = atomSize - atomHeaderSize;
    let dataOffset = offset + atomHeaderSize;

    if( atomName === "----" ) {
        // ---- atom has its data and then the desc and value.
        // desc: 4 bytes + text
        // value: 4 bytes + text
        // जातसोपेएकअझओपपदम ... etc.
        // so we need to skip the data part
        // then read the desc and value
        const descSize = data.getLongAt(dataOffset, true);
        const descName = data.getStringAt(dataOffset + 4, descSize - 4);
        dataOffset += descSize;

        const valueSize = data.getLongAt(dataOffset, true);
        const value = this._readMetadataAtom(data, dataOffset + 4, valueSize - 4);
        
        const tags = {};
        tags[descName] = value;
        
        return {
            type: "MP4",
            version: "1",
            tags: tags
        };
    } else {
        const value = this._readMetadataAtom(data, dataOffset, atomDataSize);
        return {
            type: "MP4",
            version: "1",
            tags: {
              [atomName]: value
            }
        };
    }
  }

  _readMetadataAtom(data, offset, size) {
    const dataOffset = offset + 8; // 4 bytes size, 4 bytes 'data', 8 bytes atom header
    const atomData = data.getBytesAt(dataOffset, size-8);
    const dataType = data.getByteAt(offset+7); // 1 byte type

    switch (dataType) {
      case 1: // text
        return String.fromCharCode.apply(String, atomData);
      case 13: // jpeg
      case 14: // png
        return {
          format: "image/" + (dataType === 13 ? "jpeg" : "png"),
          data: atomData
        };
      case 21: // 8-bit signed integer
        return atomData[0];
    }
  }
}

module.exports = MP4TagReader;
},{"./MediaTagReader":4}],13:[function(require,module,exports){
'use-strict';

const MediaFileReader = require('./MediaFileReader');
const MediaTagReader = require('./MediaTagReader');
const ID3v1TagReader = require('./ID3v1TagReader');
const ID3v2TagReader = require('./ID3v2TagReader');
const MP4TagReader = require('./MP4TagReader');
const FLAC_HEADER_SIZE = 4;
const FLAC_STREAMINFO_SIZE = 34;

class FLACReader extends MediaTagReader {
    constructor(mediaFileReader) {
        super(mediaFileReader);
    }
    
    _loadData(callbacks, options) {
        this._mediaFileReader.loadRange([0, FLAC_STREAMINFO_SIZE + FLAC_HEADER_SIZE -1], {
            onSuccess: () => {
                this._parseData(callbacks, options);
            },
            onError: callbacks.onError
        });
    }

    _parseData(callbacks, options) {
        const data = this._mediaFileReader;
        const flac = data.getStringAt(0, 4);
        if( flac !== "fLaC" ) {
            return callbacks.onError({
                "type": "flac",
                "info": "missing fLaC marker"
            });
        }
        
        const blockLength = data.getInteger24At(5, true);
        const nextBlock = 4 + blockLength;
        
        data.loadRange([nextBlock, nextBlock + 128], {
            onSuccess: () => {
                const id3Header = data.getStringAt(nextBlock, 3);
                if( id3Header === "TAG" ) {
                    new ID3v1TagReader(data)._loadData(callbacks, options);
                } else if( data.getStringAt(nextBlock, 3) === "ID3" ) {
                    new ID3v2TagReader(data)._loadData(callbacks, options);
                } else if ( data.getStringAt(4, 4) === "ftyp" ) {
                    new MP4TagReader(data)._loadData(callbacks, options);
                } else {
                    callbacks.onSuccess();
                }
            },
            onError: callbacks.onError
        });
    }
}

module.exports = FLACReader;
},{"./ID3v1TagReader":9,"./ID3v2TagReader":10,"./MP4TagReader":12,"./MediaFileReader":3,"./MediaTagReader":4}],14:[function(require,module,exports){
(function (global){(function (){
'use strict';
const Reader = require('./reader');
const { getFileReader } = require('./file-reader');

function read(file, callbacks) {
  new Reader(file)
    .read(callbacks);
}

const jsmediatags = {
  version: "3.9.5",
  read: read,
  Reader: Reader,
  Config: require('./config')
};

global.jsmediatags = jsmediatags;
module.exports = jsmediatags;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config":15,"./file-reader":1,"./reader":16}],15:[function(require,module,exports){
'use strict';
let config = {
    "DEFAULT_CHARSET": "iso-8859-1"
};

function setConfig(newConfig) {
  for (let key in newConfig) {
    if (newConfig.hasOwnProperty(key)) {
      config[key] = newConfig[key];
    }
  }
}

function getConfig(key) {
  return config[key];
}

module.exports = {
  "setConfig": setConfig,
  "get": getConfig
};

},{}],16:[function(require,module,exports){
'use strict';
const { getFileReader } = require('./file-reader');
const ID3Reader = require('./ID3Reader');
const MP4Reader = require('./MP4TagReader');
const FLACReader = require('./FLACReader');
const TagReaders = [ID3Reader, FLACReader, MP4Reader];

class Reader {
  constructor(file) {
    this._file = file;
    this._fileReader = getFileReader(file)(file);
  }

  read(callbacks) {
    const self = this;
    let readers = TagReaders;

    function read(i) {
      if (i >= readers.length) {
        callbacks.onSuccess({});
        return;
      }

      new readers[i](self._fileReader)
        ._loadData({
          onSuccess: function() {
            const tags = this.getTags();
            if (Object.keys(tags).length > 0) {
              callbacks.onSuccess(tags);
            } else {
              read(i + 1);
            }
          },
          onError: callbacks.onError
        });
    }

    read(0);
  }
}

module.exports = Reader;

},{"./FLACReader":13,"./ID3Reader":8,"./MP4TagReader":12,"./file-reader":1}]},{},[14])(14)
});
