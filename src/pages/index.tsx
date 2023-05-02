import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { BitcoinIcon, SendIcon } from "@/chakra/custom-chakra-icons";
import { isMobile } from "react-device-detect";
import MessageBox, { Message } from "@/components/message/message";
import {
  defaultErrorMessage,
  getErrorByBlockIndex,
} from "@/config/error-config";
import { v4 as uuidv4 } from "uuid";
import { SupaBaseDatabase } from "@/database/database";

const inter = Inter({ subsets: ["latin"] });
const initialStream: Message = {
  type: "apiStream",
  message: "",
  uniqueId: "",
};
const matchFinalWithLinks = /(^\[\d+\]:\shttps:\/\/)/gm;
interface RatingProps {
  messageId: string;
  rateAnswer: (messageId: string, value: number) => void;
}

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streamLoading, setStreamLoading] = useState(false)
  const [streamData, setStreamData] = useState<Message>(initialStream)
  const [ratings, setRatings] = useState({});
  const [messages, setMessages] = useState<Message[]>([
    {
      message: "Hi there! How can I help?",
      type: "apiMessage",
      uniqueId: "",
    },
  ]);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.scrollTop = messageList?.scrollHeight;
    }
  }, [messages]);

  // Focus on text field on load
  useEffect(() => {
    textAreaRef.current && textAreaRef.current.focus();
  }, []);

  useEffect(() => {
    if (textAreaRef?.current) {
      const _textarea = textAreaRef.current;
      const _length = userInput?.split("\n")?.length;
      _textarea.rows = _length > 3 ? 3 : (Boolean(_length) && _length) || 1;
    }
  }, [userInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const updateMessages = async (finalText: string, uuid:string) => {
    setTimeout(() => {
      setStreamLoading(false)
      setStreamData(initialStream)
      setMessages((prevMessages) => [...prevMessages, { message: finalText, type: "apiMessage" , uniqueId : uuid}]);
    }, 1000);
  };

  const addDocumentToMongoDB = async (payload) => {
    const response = await fetch("/api/mongo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { data } = await response.json();
    return data;
  };
  const getDocumentInMongoDB = async (uniqueId) => {
    const response = await fetch("/api/mongo?unique="+uniqueId, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const { data } = await response.json();
    return data;
  };

  const updateDocumentInMongoDB = async (uniqueId, payload) => {
    const response = await fetch("/api/mongo?unique="+uniqueId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const { data } = await response.json();
    return data;
  };

  const fetchResult = async (query: string) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [
          {
            question: query,
          },
        ],
      }),
    });
    return response;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = userInput.trim();
    if (query === "") {
      return;
    }
    let uuid = uuidv4();
    setLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: userInput, type: "userMessage", uniqueId: uuid },
    ]);
    setUserInput("");

    const errMessage = "Something went wrong. Try again later";

    try {
      const response: Response = await fetchResult(query);
      if (!response.ok) {
        throw new Error(errMessage);
      }
      const data = response.body;
      const reader = data?.getReader();
      let done = false;
      let finalAnswerWithLinks = "";

      if (!reader) throw new Error(errMessage);
      const decoder = new TextDecoder();
      setLoading(false);
      setStreamLoading(true);
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value);

        if (matchFinalWithLinks.test(chunk)) {
          finalAnswerWithLinks = chunk;
        } else {
          setStreamData((data) => {
            const _updatedData = { ...data };
            _updatedData.message += chunk;
            return _updatedData;
          });
        }
      }

      let question = userInput;
      let answer = finalAnswerWithLinks;
      let uniqueIDD = uuid;
      // let date_ob = new Date();
      let payload = {
        uniqueId: uniqueIDD,
        question: question,
        answer: answer,
        rating: null,
        createdAt:((new Date()).toISOString()).toLocaleString('zh-TW'),
        updatedAt:null
      };
      //mongodb database
      // await addDocumentToMongoDB(payload);

      //supabase database
      await SupaBaseDatabase.getInstance().insertData(payload);

      await updateMessages(finalAnswerWithLinks, uuid);
    } catch (err: any) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: err?.message ?? defaultErrorMessage, type: "errorMessage", uniqueId: uuidv4(),},
      ]);
    }
    setLoading(false);
  };

  // Prevent blank submissions and allow for multiline input
  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isMobile) {
        e.preventDefault();
      } else {
        if (!e.shiftKey && userInput) {
          handleSubmit(e);
        }
      }
    }
  };

  const Rating = ({ messageId, rateAnswer }: RatingProps) => {
    const [rating, setRating] = useState(0);

    const onRatingChange = async (value: number) => {
      setRating(value);
      rateAnswer(messageId, value);

      //mongodb database
      // let payload = {
      //   uniqueId: messageId,
      //   question: "hello",
      //   answer: "hello",
      //   rating: value,
      // };
      // let data = await getDocumentInMongoDB(messageId);
      // data = data[0]
      // data.rating = value
      // console.log("data:::",data)
      // await updateDocumentInMongoDB(messageId, data);

      //supabase database
      var currentdate = ((new Date()).toISOString()).toLocaleString('zh-TW');
      await SupaBaseDatabase.getInstance().updateData(value, messageId,currentdate);
    };

    return (
      <div>
        <span>Rate this answer:</span>
        {["😢", "😐", "🥳"].map((value, index) => (
          <button
            key={index + 1}
            onClick={() => onRatingChange(index + 1)}
            disabled={rating === index + 1}
          >
            {value}
          </button>
        ))}
      </div>
    );
  };
  const rateAnswer = (messageId: string, value: number) => {
    setRatings((prevRatings) => ({
      ...prevRatings,
      [messageId]: value,
    }));
  };

  return (
    <>
      <Head>
        <title>Chat Bitcoin Search</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/bitcoin.svg" />
      </Head>
      <Box position="relative" overflow="hidden" w="full" h="full">
        <Container
          display="flex"
          flexDir="column"
          alignItems="center"
          maxW={"1280px"}
          h="100%"
          p={4}
          centerContent
        >
          <Flex
            gap={2}
            alignItems="center"
            mt={{ base: 3, md: 8 }}
            justifyContent="center"
          >
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }}>
              ChatBTC
            </Heading>
            <BitcoinIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
          </Flex>
          <Flex
            id="main"
            width="full"
            h="full"
            maxW="820px"
            my={5}
            flexDir="column"
            gap="4"
            justifyContent="space-around"
            overflow="auto"
          >
            <Box
              ref={messageListRef}
              w="full"
              bgColor="gray.900"
              borderRadius="md"
              flex="1 1 0%"
              overflow="auto"
              maxH="100lvh"
            >
              {messages.length &&
                messages.map((message, index) => {
                  const isApiMessage = message.type === "apiMessage";
                  const greetMsg =
                    message.message === "Hi there! How can I help?";
                  return (
                    <div key={index}>
                      <MessageBox content={message} />
                      {isApiMessage && !greetMsg && (
                        <Rating
                          messageId={message.uniqueId}
                          rateAnswer={rateAnswer}
                        />
                      )}
                    </div>
                  );
                })}
              {(loading || streamLoading) && (
                <MessageBox
                  // messageId={uuidv4()}
                  content={{ message: streamData.message, type: "apiStream", uniqueId:uuidv4()}}
                  loading={loading}
                  streamLoading={streamLoading}
                />
              )}
            </Box>
            {/* <Box w="100%" maxW="100%" flex={{base: "0 0 50px", md:"0 0 100px"}} mb={{base: "70px", md: "70px"}}> */}
            <Box w="100%">
              <form onSubmit={handleSubmit}>
                <Flex gap={2} alignItems="flex-end">
                  <Textarea
                    ref={textAreaRef}
                    name=""
                    id="userInput"
                    rows={1}
                    resize="none"
                    disabled={loading}
                    value={userInput}
                    onChange={handleInputChange}
                    bg="gray.700"
                    flexGrow={1}
                    flexShrink={1}
                    onKeyDown={handleEnter}
                  />
                  <IconButton
                    isLoading={loading}
                    aria-label="send chat"
                    icon={<SendIcon />}
                    type="submit"
                  />
                </Flex>
              </form>
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  );
}
