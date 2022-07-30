import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import styles from "../styles/Home.module.css";
import Head from "next/head";
import { NFT_CONTRACT_ABI, NFT_CONSTRACT_ADDRESS } from "../constants";

export default function Home() {
  const [isPresaleStarted, setIsPresaleStarted] = useState(false);
  const [isPresaleEnded, setIsPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [numTokensMinted, setnumTokensMinted] = useState("");

  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const web3ModalRef = useRef();

  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const owner = await nftContract.owner();

      const userAddress = await signer.getAddress();

      if (owner.toLowerCase() === userAddress.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const startPresale = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.startPresale();

      await txn.wait();

      setIsPresaleStarted(true);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const PresaleBool = await nftContract.presaleStarted();
      setIsPresaleStarted(PresaleBool);
      return PresaleBool;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const PresaleEndtime = await nftContract.presaleEnded();
      const currentTime = Date.now() / 1000;
      const hasPresaleEnded = PresaleEndtime.lt(Math.floor(currentTime));

      if (hasPresaleEnded) {
        setIsPresaleEnded(true);
      } else {
        setIsPresaleEnded(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getNumMintedTokens = async () => {
    try {
      const provider = await getProviderOrSigner();

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      const numMintedTokens = await nftContract.tokenIds();
      setnumTokensMinted(numMintedTokens.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const onPageLoad = async () => {
    await connectWallet();
    const presaleStarted = await checkIfPresaleStarted();

    await getOwner();
    if (presaleStarted) {
      await checkIfPresaleEnded();
    }

    await getNumMintedTokens();

    setInterval(async () => {
      await getNumMintedTokens();
    }, 5 * 1000);

    setInterval(async () => {
      const started = await checkIfPresaleStarted();
      if (started) {
        await checkIfPresaleEnded();
      }
    }, 5 * 1000);
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad();
    }
  }, []);

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 4) {
      window.alert("Please switch to rinkeby");
      throw new Error("Incorrect Network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const presaleMint = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);

      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const cost = utils.parseEther("0.01");

      const txn = await nftContract.presaleMint({
        value: cost,
      });
      await txn.wait();
      window.alert("CrytpoDev minted successfully");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const publicMint = async () => {
    try {
      setLoading(true);
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(
        NFT_CONSTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        signer
      );

      const txn = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      await txn.wait();
      window.alert("CrytpoDev minted successfully");
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  function renderBody() {
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      );
    }
    if (loading) {
      return <span className={styles.description}>Loading...</span>;
    }
    if (isOwner && !isPresaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale
        </button>
      );
    }

    if (!isPresaleStarted) {
      return (
        <div>
          <span className={styles.description}>
            Presale has not started yet, come back later
          </span>
        </div>
      );
    }

    if (isPresaleStarted && !isPresaleEnded) {
      return (
        <div>
          <span className={styles.description}>
            Presale has Started! If your address is whitelisted, you can mint a
            CryptoDev
          </span>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint
          </button>
        </div>
      );
    }

    if (isPresaleEnded) {
      return (
        <div>
          <span className={styles.description}>
            Presale has Ended! You can mint a CryptoDev if any remain
          </span>
          <button className={styles.button} onClick={publicMint}>
            Public Mint
          </button>
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs NFt</h1>
          <div className={styles.description}>
            CryptoDevs NFT is a collection of Developers in web3 <br /> <br />
          </div>
          <div className={styles.descriptio}>
            {numTokensMinted}/20 have already been minted
          </div>

          {renderBody()}
        </div>
        <img src="/cryptodevs/0.svg" className={styles.image} />
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
