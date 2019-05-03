const fs = require('fs');
const path = require('path');

module.exports = function(ctx) {
    
    var xml = ctx.requireCordovaModule('cordova-common').xmlHelpers;
    
    // Parse config.xml for replacements
    var config = xml.parseElementtreeSync(path.join(ctx.opts.projectRoot, 'config.xml'));
    var elements = config.findall("./platform");
    
    var platforms = null;
    
    for(var i = 0; i < elements.length; ++i) {
        var element = elements[i];
        var replaceElements = element.findall("./replace-string");
        if(replaceElements.length === 0) continue;
        
        if(!platforms) {
            platforms = {};
        }
        
        if(!(element.attrib.name in platforms)) {
            platforms[element.attrib.name] = {};
        }
        
        for(var j = 0; j < replaceElements.length; ++j) {
            var replaceElement = replaceElements[j];
            if(!(replaceElement.attrib.file in platforms[element.attrib.name])) {
                platforms[element.attrib.name][replaceElement.attrib.file] = {};
            }
            
            platforms[element.attrib.name][replaceElement.attrib.file][replaceElement.attrib.replace] = replaceElement.attrib.find;
        }
    }
    if(!platforms) {
        return;
    }
    
    // Run the replacements
    console.log("Executing string replace");
    var regex = /^regex\:/i;
    
    for(var platform in platforms) {
        if(!platforms.hasOwnProperty(platform) || ctx.opts.platforms.indexOf(platform) < 0) continue;
        console.log("Beginning replacement for platform %s", platform);
        
        var platformReplace = platforms[platform];
        var platformRoot = path.join(ctx.opts.projectRoot, 'platforms', platform);
        
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
        
        console.log("Completed replacement for platform %s", platform);
    }
    
};