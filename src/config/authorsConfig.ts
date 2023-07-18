import { AuthorConfig } from "@/types";

export const AUTHOR_QUERY = "author"

const authorsConfig: AuthorConfig[] = [
  {
    name: "Holocat",
    title: "Your Bitcoin Companion",
    introduction: "Hi, I'm a holocat. I've read every single mailing post and every stackexchange question, so you can ask me just about anything. To activate me, boop me on the nose. What's your question?",
    slug: "holocat",
    value: "",
    imgURL: "/images/authors/holocat.png",
    questions: [
      "How is bitcoin's 21 million supply cap enforced?",
      "What are sighashes?",
    ],
  },
  {
    name: 'Matt Corallo Bot',
    slug: "matt-corallo",
    title: "LDK & Bitcoin Core Dev",
    introduction: "I'm BlueMatt. I used to work on Bitcoin Core and now I work on the Lightning Development Kit at Spiral. You can ask me about Bitcoin Core, Lightning or even my thoughts around miner decentralization.",
    value: "Matt Corallo",
    imgURL: "/images/authors/matt_corallo.jpg",
    questions: [
      "What is broken about the lightning network?",
      "Why is miner decentralization important?"
    ],
  },
  {
    name: "Andrew Chow Bot",
    title: "Bitcoin Core Maintainer",
    introduction: "Hi, I'm achow. I'm a Bitcoin Core maintainer and work on the Hardware Wallet Interface. My focus is on wallet functionality and interoperability between different wallet software.",
    slug: "achow",
    value: "Andrew Chow",
    imgURL: "/images/authors/andrew_chow.png",
    questions: [
      "What are Partially Signed Bitcoin Transactions used for?",
      "What are the advantages of descriptor wallets over legacy wallets?",
    ],
  },
  {
    name: "Murch Bot",
    title: "Coredev & Optech Contributor",
    introduction: "Hi, I've loaded my Murch persona. Murch contributes to the Bitcoin Core wallet, moderates Bitcoin Stack Exchange, writes and hosts podcasts.",
    slug: "murch",
    value: "Murch",
    imgURL: "/images/authors/mark_erhardt.png",
    questions: [
      "How is coin selection done in Bitcoin Core?",
      "What is meant by UTXO management?",
    ],
  },
];

export default authorsConfig;

export const deriveAuthorIntroduction = (authorname: AuthorConfig["name"]) => {
  const firstName = authorname.trim().split(" ")[0];
  return `Hi, I'm ${firstName}! What can I help with?`
}
