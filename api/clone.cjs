const shell = require('shelljs');
const fs = require('fs');
const clonePath = './sigma';

fs.access('./sigma', function (error) {
  if (error) {
    console.log('Sigma directory does not exist. cloning into repo');
    //Clone repo
    const targetPath = './';
    shell.cd(targetPath);
    shell.exec('git clone https://github.com/SigmaHQ/sigma.git');

    //Remove all files
    fs.readdirSync('./sigma').forEach((file) => {
      try {
        fs.unlink(`${clonePath}/${file}`, () => {
          console.log(file, 'deleted');
        });
      } catch (err) {
        console.error(err);
      }
    });

    //Remove all folders
    fs.readdir(clonePath, { withFileTypes: true }, (error, files) => {
      files.forEach((file) => {
        if (file.name !== 'rules') {
          fs.rmSync(`${clonePath}/${file.name}`, { recursive: true });
        }
      });
    });
  } else {
    console.log('Sigma directory already exists.');
  }
});
