import { Flex, Heading, Text } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";

export interface Message {
  message?: string;
  type: "userMessage" | "apiMessage" | "errorMessage";
}
const messageConfig = {
  apiMessage: {
    color: null,
    bg: "gray.600",
    text: "ChatBTC",
    headingColor: "orange.400",
  },
  userMessage: {
    color: null,
    bg: "gray.800",
    text: "You",
    headingColor: "purple.400",
  },
  errorMessage: {
    color: "red.200",
    bg: "gray.600",
    text: "ChatBTC",
    headingColor: "red.500",
  },
};

const MessageBox = ({
  message,
  isLoading,
}: {
  message: Message;
  isLoading?: boolean;
}) => {
  const type = message.type;
  return (
    <Flex
      flexDir="column"
      gap={{ base: 1, md: 2 }}
      w="100%"
      bgColor={messageConfig[type].bg ?? ""}
      textAlign={type === "userMessage" ? "right" : "left"}
      py={{ base: 3, md: 4 }}
      px={{ base: 3, md: 4 }}
    >
      {/* <Box w="100%" bgColor={type === "userMessage" ? "gray.800" : "gray.600"} py="8" px={{base: 3, md: 4}}> */}
      <Heading
        color={messageConfig[type].headingColor}
        fontSize="sm"
        fontWeight={600}
      >
        {messageConfig[type].text}
      </Heading>
      {isLoading ? (
        <BeatLoader color="white" />
      ) : (
        <Text whiteSpace="pre-wrap" color={messageConfig[type].color || ""}>
          {message.message}
        </Text>
      )}
    </Flex>
  );
};

export default MessageBox;
