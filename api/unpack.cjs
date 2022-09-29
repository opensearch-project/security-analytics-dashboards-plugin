const fs = require('fs');
const path = require('path');
const dir = './sigma/rules';

fs.readdir(dir, { withFileTypes: true }, (error, folders) => {
  folders.forEach((folder) => {
    const folderPath = path.join(dir,folder.name)
    function traverseDir(dir) {
      fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        console.log('unpacking to json:', file)
        if (fs.lstatSync(fullPath).isDirectory()) {
           console.log(fullPath);
           traverseDir(fullPath);
         } else {
             outputfile = `./mockData/${folder.name}/${file}.json`.replace('.yml', '');
           (yaml = require('js-yaml')),
           (obj = yaml.load(
             fs.readFileSync(`${dir}/${file}`, { encoding: 'utf-8' })
           ));
           fs.writeFileSync(outputfile, JSON.stringify(obj, null, 2));
         }  
      });
    }
    traverseDir(folderPath)
  });
});



