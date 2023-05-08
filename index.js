const puppeteer = require('puppeteer');
const fs = require('fs');

let chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';

let lerJSON = fs.readFileSync('produtos.json')
let objeto = JSON.parse(lerJSON)
// console.log('res: ', objeto)

let listaUrl = [];

objeto.forEach(element => {
  const str = element.gtin;
  const words = str.split(' ');
  // console.log(words[1])
  let urlPesquisa = `https://cosmos.bluesoft.com.br/produtos/${words[1]}`
  listaUrl.push(urlPesquisa)
});

async function salvaRelatorio() {
  const navegador = await puppeteer.launch({    
    executablePath: chrome,  
    headless: false,
    defaultViewport: null,
  });

// (async () => {
//   await pagina.click('.btn-success');
//   await pagina.waitForTimeout(1000);
// })();

  let arrayJson = [];
  
for(let i = 0; i < listaUrl.length; i++) {
  setTimeout(async function(){
    //console.log(listaUrl[i])
      const pagina = await navegador.newPage();
      await pagina.goto(listaUrl[i]);
      // await pagina.click('.accept-cookies-button');
      await pagina.setUserAgent(userAgent);
      await pagina.waitForSelector('.page-header');

      // desce a página 5 vezes para carregar mais produtos
      for (let j = 0; j < 1; j++) {
        await pagina.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await pagina.waitForTimeout(3000);
      }

      const data = await pagina.evaluate(() => {
        //const listaCanais = document.querySelector('.tv__player-channels > a', el => el.map(link => link.href));
        const listaProdutos = document.querySelectorAll('.dl-horizontal');
        const produtosArray = [...listaProdutos];
      
        const produtos = produtosArray.map((produto) => {
          const imagem = produto.querySelector('.thumbnail-container');
          const nome = produto.querySelector('.description');
          const gtin = produto.querySelector('.barcode');
          const categoriaProduto = produto.querySelector('.gpc-name');
          const marcaDoProduto = produto.querySelector('.brand-name');
          const valorMedio = produto.querySelector('.description');
          
          return {
            imagem: imagem ? imagem.src : null,
            nome: nome ? nome.innerText : null,
            gtin: gtin ? gtin.innerText : null,
            categoriaProduto: categoriaProduto ? categoriaProduto.innerText : null,
            marcaDoProduto: marcaDoProduto ? marcaDoProduto.innerText : null,
            valorMedio: valorMedio ? valorMedio.innerText : null,
          };
        });
        
        return produtos;
      });

      arrayJson.push(...data)
      console.log('res', arrayJson);
      // Tempo para fechar a ultima aba aberta, desta forma economizamos memoria ram
      setTimeout(async function(){
        await pagina.close()
      },7000) 
      return
    },i*7000); 
  };
};
salvaRelatorio();