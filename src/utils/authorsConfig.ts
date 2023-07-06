import { AuthorConfig } from "@/types";

export const AUTHOR_QUERY = "author"

const authorsConfig: AuthorConfig[] = [
  {
    name: "Blippy",
    title: "Your Bitcoin Assistant",
    slug: "blippy",
    value: "",
    imgURL: "/images/authors/blippy.png",
    questions: [
      "How is bitcoin's 21 million supply cap enforced?",
      "What is bitcoin mining?",
    ],
  },
  {
    name: "Matt Corallo",
    slug: "matt-corallo",
    title: "Bitcoin Core / LDK Dev",
    value: "Matt Corallo",
    imgURL: "/images/authors/matt_corallo.jpg",
    questions: ["Why is lightning broken?", "How do mining pools work?"],
  },
  {
    name: "Pieter Wiulle",
    slug: "pieter-wiulle",
    title: "Bitcoin Core Dev",
    value: "Pieter Wiulle",
    imgURL: "/images/authors/pieter_wuille.jpg",
    questions: [
      "How does taproot work?",
      "How would total ordering on mempool transactions work?",
    ],
  },
  {
    name: "Greg Maxwell",
    slug: "greg-maxwell",
    title: "Bitcoin Core Contributor",
    value: "Greg Maxwell",
    imgURL: "/images/authors/greg_maxwell.png",
    questions: [
      "How does a sidechain two-way peg work?",
      "What is a Confidential Transaction?",
    ],
  },
];

export default authorsConfig;
