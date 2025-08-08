const express = require('express');
const chromium = require('chrome-aws-lambda'); // <-- novo
const puppeteer = require('puppeteer-core');

const app = express();

app.get('/verificar-form', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Parâmetro 'url' obrigatório.");

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const html = await page.content();
    await browser.close();

    if (html.includes("Desculpe. Não foi possível publicar o documento.")) {
      return res.send("Offline");
    } else {
      return res.send("Rodando");
    }

  } catch (e) {
    console.error(e);
    return res.status(500).send("Erro ao acessar o formulário.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));
