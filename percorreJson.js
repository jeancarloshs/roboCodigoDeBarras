const puppeteer = require('puppeteer');
const fs = require('fs');

let chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';

let lerJSON = fs.readFileSync('produtos.json')
let objeto = JSON.parse(lerJSON)
// console.log('res: ', objeto)

let listaUrl = []

objeto.forEach(element => {
  const str = element.gtin;
  const words = str.split(' ');
  // console.log(words[1])
  let urlPesquisa = `https://cosmos.bluesoft.com.br/produtos/${words[1]}`
  listaUrl.push(urlPesquisa)
});

for(let i = 0; i <= listaUrl.length; i++) {
    function msgEncerramento() {
        console.log(listaUrl[i])
    }
    setTimeout(msgEncerramento, 3000)
}

// async function salvaRelatorio() {
//     const navegador = await puppeteer.launch({    
//       executablePath: chrome,  
//       headless: 'new',
//       defaultViewport: null,
//     });
//     const pagina = await navegador.newPage();
    
//     await pagina.goto(listaUrl);
//     await pagina.setUserAgent(userAgent);
  
//     await pagina.waitForSelector('.page-header');

// };
// salvaRelatorio();