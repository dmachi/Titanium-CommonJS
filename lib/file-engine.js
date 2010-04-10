
// -- kriskowal Kris Kowal Copyright (C) 2009-2010 MIT License
// -- cadorn Christoph Dorn
var IO = require("io").IO;
var os = require('os');

var exports = require('file');

exports.SEPARATOR = '/';

var FilePath = function (path) {
	if (path && typeof path != 'string') {
		return path;
	}
	try {
		path = Titanium.Filesystem.getFile(path || ".");
		return path
	}catch(err){
		Titanium.API.debug("File not found: " + path);
	}
};

exports.cwd = function () {
    throw Error("cwd not yet implemented.");
    // might work if you don't implement canonical
    // in terms of cwd:
    return exports.canonical('.');
};

exports.list = function (path) {
	return FilePath(path).getDirectoryListing();
};

// TODO necessary for package loading
exports.canonical = function (path) {
    throw Error("canonical not yet implemented.");
    // an implementation in terms of readlink, cwd, and the pure-js
    // methods provided by Narwhal's file-bootstrap, join, split,
    // and isDrive, which depends on system.os to distinguish
    // windows and unix drives
    var paths = [exports.cwd(), path];
    var outs = [];
    var prev;
    for (var i = 0, ii = paths.length; i < ii; i++) {
        var path = paths[i];
        var ins = exports.split(path);
        if (exports.isDrive(ins[0]))
            outs = [ins.shift()];
        while (ins.length) {
            var leaf = ins.shift();
            var consider = exports.join.apply(
                undefined,
                outs.concat([leaf])
            );

            // cycle breaker; does not throw an error since every
            // invalid path must also have an intrinsic canonical
            // name.
            if (consider == prev) {
                ins.unshift.apply(ins, exports.split(link));
                break;
            }
            prev = consider;

            try {
                var link = exports.readlink(consider);
            } catch (exception) {
                link = undefined;
            }
            if (link !== undefined) {
                ins.unshift.apply(ins, exports.split(link));
            } else {
                outs.push(leaf)
            }
        }
    }
    return exports.join.apply(undefined, outs);
};

exports.exists = function (path) {
    throw Error("exists not yet implemented.");
};


exports.mtime = function (path) {
    path = FilePath(path);
    if (!path.isFile(path)){return;}

    var lastModified = path.modificationTimestamp();
    if (lastModified === 0) return undefined;
    else return new Date(lastModified);
};

exports.size = function (path) {
    path = FilePath(path);
    if (!path.isFile(path)){return;}
    return path.size();
};

exports.stat = function (path) {
    path = FilePath(path);
    return {
        mtime: exports.mtime(path),
        size: exports.size(path)
    }
};

exports.isDirectory = function (path) {
	return FilePath(path).isDirectory();
};

exports.isFile = function (path) {
	return FilePath(path).isFile();
};

exports.isLink = function (path) {
	return FilePath(path).isSymbolicLink();
};

exports.isReadable = function (path) {
	return !FilePath(path).isReadOnly();
};

exports.isWritable = function (path) {
	return FilePath(path).isWritable()
};

exports.rename = function (source, target) {
	return FilePath(path).rename(source, target);
};

exports.move = function (source, target) {
	return FilePath(path).move(source, target);
};

exports.remove = function (path) {
	throw Error("remove not yet implemented.");
};

exports.mkdir = function (path) {
	throw Error("mkdir not yet implemented.");
};

exports.rmdir = function(path) {
	throw Error("rmdir not yet implemented.");
};

exports.touch = function (path, mtime) {
	throw Error("touch not yet implemented.");
};

exports.read = function (path) {
	return FilePath(path).read();
};

exports.FileIO = function (path, mode, permissions) {
	mode = exports.mode(mode);
	var read = mode.read,
		write = mode.write,
		append = mode.append,
		update = mode.update;

	if (update) {
		throw new Error("Updating IO not yet implemented.");
	} else if (write || append) {
		var stream = Titanium.Filesystem.getFileStream(path);
		stream.open(stream.MODE_WRITE, true, append);
		return new IO(null, stream);
	} else if (read) {
		var stream = Titanium.Filesystem.getFileStream(path);
		stream.open(stream.MODE_READ, false);
		return new IO(stream, null);
	} else {
		throw new Error("Files must be opened either for read, write, or update mode.");
	}
};

