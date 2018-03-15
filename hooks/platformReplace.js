module.exports = function(ctx) {
    
    var fs = ctx.requireCordovaModule('fs'),
        path = ctx.requireCordovaModule('path'),
        q = ctx.requireCordovaModule('q'),
        xml = ctx.requireCordovaModule('cordova-common').xmlHelpers;
    
    // Parse config.xml for replacements
    var config = xml.parseElementtreeSync(path.join(ctx.opts.projectRoot, 'config.xml'));
    var platforms = config.findall("./platform");
    
    var replace = null;
    
    for(var i = 0; i < platforms.length; ++i) {
        var platform = platforms[i];
        var replacements = platform.findall("./replace-string");
        if(replacements.length === 0) continue;
        
        if(!replace) {
            replace = {};
        }
        
        if(!(platform.attrib.name in replace)) {
            replace[platform.attrib.name] = {};
        }
        
        for(var j = 0; j < replacements.length; ++j) {
            var replacement = replacements[j];
            if(!(replacement.attrib.file in replace[platform.attrib.name])) {
                replace[platform.attrib.name][replacement.attrib.file] = {};
            }
            
            replace[platform.attrib.name][replacement.attrib.file][replacement.attrib.replace] = replacement.attrib.find;
        }
    }
    if(!replace) {
        return;
    }
    
    // Run the replacements
    console.log("Executing string replace");
    var regex = /^regex\:/i
    
    for(var i in replace) {
        if(!replace.hasOwnProperty(i) || ctx.opts.platforms.indexOf(i) < 0) continue;
        console.log("Beginning replacement for platform %s", i);
        
        var platformReplace = replace[i];
        var platformRoot = path.join(ctx.opts.projectRoot, 'platforms', i);
        
        for(var file in platformReplace) {
            if(!platformReplace.hasOwnProperty(file)) continue;
            
            var fileReplacements = platformReplace[file];
            var filePath = path.join(platformRoot, file);
            
            console.log("Processing file %s", filePath);
            
            var result = fs.readFileSync(filePath, 'utf8');
            for(var replacement in fileReplacements) {
                if(!fileReplacements.hasOwnProperty(replacement)) continue;
                
                var search = fileReplacements[replacement];
                if(regex.test(search)) {
                    search = new RegExp(search.replace(regex, ''), "ig");
                }
                
                result = result.replace(search, replacement);
            }
            
            fs.writeFileSync(filePath, result, 'utf8');
        }
        
        console.log("Completed replacement for platform %s", i);
    }
    
};