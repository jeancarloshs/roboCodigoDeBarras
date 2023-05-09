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
    headless: 'new',
    defaultViewport: null,
  });

// (async () => {
//   await pagina.click('.btn-success');
//   await pagina.waitForTimeout(1000);
// })();

  let arrayJson = [];
  let arrayErros = []; // array para armazenar os erros
  
for(let i = 0; i < listaUrl.length; i++) {
  setTimeout(async function(){
    //console.log(listaUrl[i])
    try {
      const pagina = await navegador.newPage();
      await pagina.goto(listaUrl[i]);
      // await pagina.click('.accept-cookies-button');
      await pagina.setUserAgent(userAgent);
      await pagina.waitForSelector('.page-header', { timeout: 1200000 });

      // desce a página 5 vezes para carregar mais produtos
      for (let j = 0; j < 1; j++) {
        await pagina.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await pagina.waitForTimeout(500);
      }

      const data = await pagina.evaluate(() => {
        const listaProdutos = document.querySelectorAll('.main');
        const produtosArray = [...listaProdutos];
      
        const produtos = produtosArray.map((produto) => {
          const imagem = produto.querySelector('#product-gallery > .product-thumbnail > img');
          const nome = produto.querySelector('#product_description');
          const gtin = produto.querySelector('#product_gtin');
          const categoriaProduto = produto.querySelector('.gpc-name');
          const marcaDoProduto = produto.querySelector('.brand-name');
          const valorMedio = produto.querySelector('.dl-horizontal dd:last-child');
          
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
      console.log('res', [i]);

      // Tempo para fechar a ultima aba aberta, desta forma economizamos memoria ram
      setTimeout(async function(){
        fs.writeFileSync('listaProdutos.json', JSON.stringify(arrayJson, null, 2), err => {
          if(err) throw new Error ('Algo deu errado')
          console.log('Tudo certo!!!')
        });
        await pagina.close()
      },1500)
      return
    } catch (error) {
      console.error(`Erro na extração de dados da URL ${listaUrl[i]}.`, error);
      arrayErros.push({url: listaUrl[i], erro: error.message}); // adiciona o erro ao array de erros
      // se este for o último loop, escreve o array de erros em um arquivo JSON separado
      fs.writeFileSync('erros.json', JSON.stringify(arrayErros, null, 2), err => {
        if(err) throw new Error ('Algo deu errado')
        console.log('Erros salvos em erros.json')
      });
    }
    },i*1500); 
  };
};
salvaRelatorio();