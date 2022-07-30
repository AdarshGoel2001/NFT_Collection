// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const tokenId = req.query.tokenId;
  const name = `Crypto Dev # ${tokenId}`;
  const description = "CryptoDevs is an NFT colection for Web3 Developers";
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/50e03c5cf9d7479289f57c279eb1f467fd859379/my-app/public/cryptodevs/${
    Number(tokenId) - 1
  }.svg`;

  return res.json({ name: name, description: description, image: image });
}
