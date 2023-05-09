const puppeteer = require('puppeteer');
const fs = require('fs');
// require('dotenv').config();

let chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';
let urlComosBlueSoft = 'https://cosmos.bluesoft.com.br/gpcs/cuidados-com-o-bebe-54000000/produtos?page=1'; 
// let nomeCategoria = document.querySelectorAll('.page-header > a');
let arrayJson = []

async function salvaRelatorio() {
  const navegador = await puppeteer.launch({    
    executablePath: chrome,  
    headless: 'new',
    defaultViewport: null,
  });
  const pagina = await navegador.newPage();
  
  await pagina.goto(urlComosBlueSoft);
  await pagina.setUserAgent(userAgent);

  await pagina.waitForSelector('ul.pagination');

  const numPaginas = await pagina.evaluate(() => {
    const ul = document.querySelector('ul.pagination');
    const lis = ul.querySelectorAll('li');
    const ultimaPagina = lis[lis.length - 2];
    const numPaginas = parseInt(ultimaPagina.innerText);
    return numPaginas;
  });

  for( let i = 1; i <= numPaginas; i++ ) {

  await Promise.all([
    pagina.waitForSelector('.list-product-horizontal')
  ])

const data = await pagina.evaluate(() => {
  //const listaCanais = document.querySelector('.tv__player-channels > a', el => el.map(link => link.href));
  const listaProdutos = document.querySelectorAll('.product-list-item');
  const produtosArray = [...listaProdutos];

  const produtos = produtosArray.map((produto) => {
    const categoriaProduto = produto.querySelector('.page-header');
    const imagem = produto.querySelector('.list-item-thumbnail').src;
    const nome = produto.querySelector('.description').innerText;
    const gtin = produto.querySelector('.barcode').innerText;

    return {
      categoriaProduto,
      imagem,
      nome,
      gtin,
    };
  });

  return produtos;
});

  arrayJson.push(...data)


await pagina.click('.next_page')
await pagina.waitForTimeout(2000);
console.log('Página Atual: ', [i])

}

fs.writeFile('produtos.json', JSON.stringify(arrayJson, null, 2), err => {
    if(err) throw new Error ('Algo deu errado')
    
    console.log('Tudo certo!!!')
  })

  //await pagina.waitForTimeout(5000);
  //await pagina.screenshot({path: 'nxplay.png'});

  //await frame.waitForTimeout(30000);
  //await navegador.close();
}
salvaRelatorio()