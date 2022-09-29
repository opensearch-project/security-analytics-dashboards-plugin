const express = require('express');
const cors = require('cors');

const fs = require('fs');

const server = express();

const PORT = 9999;

server.use(express.json());
server.use(cors());

let rules = [];
let applicationRules = [];
let aptRules = [];
let cloudRules = [];
let complianceRules = [];
let linuxRules = [];
let macosRules = [];
let networkRules = [];
let proxyRules = [];
let webRules = [];
let windowsRules = [];


fs.readdirSync('./mockData/application').forEach((file) => {
  let json = require(`./mockData/application/${file}`);
  rules.push(json);
  applicationRules.push(json)
});

fs.readdirSync('./mockData/apt').forEach((file) => {
  let json = require(`./mockData/apt/${file}`);
  rules.push(json);
  aptRules.push(json)
});

fs.readdirSync('./mockData/cloud').forEach((file) => {
  let json = require(`./mockData/cloud/${file}`);
  rules.push(json);
  cloudRules.push(json)
});

fs.readdirSync('./mockData/compliance').forEach((file) => {
  let json = require(`./mockData/compliance/${file}`);
  rules.push(json);
  complianceRules.push(json)
});

fs.readdirSync('./mockData/linux').forEach((file) => {
  let json = require(`./mockData/linux/${file}`);
  rules.push(json);
  linuxRules.push(json)
});

fs.readdirSync('./mockData/macos').forEach((file) => {
  let json = require(`./mockData/macos/${file}`);
  rules.push(json);
  macosRules.push(json)
});

fs.readdirSync('./mockData/network').forEach((file) => {
  let json = require(`./mockData/network/${file}`);
  rules.push(json);
  networkRules.push(json)
});

fs.readdirSync('./mockData/proxy').forEach((file) => {
  let json = require(`./mockData/proxy/${file}`);
  rules.push(json);
  proxyRules.push(json)
});

fs.readdirSync('./mockData/web').forEach((file) => {
  let json = require(`./mockData/web/${file}`);
  rules.push(json);
  webRules.push(json)
});

fs.readdirSync('./mockData/windows').forEach((file) => {
  let json = require(`./mockData/windows/${file}`);
  rules.push(json);
  windowsRules.push(json)
});

const data = [rules, applicationRules, aptRules, cloudRules, complianceRules, linuxRules, macosRules, networkRules, proxyRules, webRules, windowsRules]




server.get('/', function (req, res) {
  res.json(data);
});

server.listen(PORT, () => console.log(`Mock running on port ${PORT}`));
