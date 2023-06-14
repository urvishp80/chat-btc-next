import { BitcoinIcon, LightBulbIcon, PencilIcon } from '@/chakra/custom-chakra-icons';
import { Box, Flex, Grid, GridItem, Heading, Icon, Text } from '@chakra-ui/react';
import React from 'react';

type TextBubble = {text: string, type: "prompt" | "about"}

const textBubbles: TextBubble[] = [
  {text: '"What are the benefits of using miniscript?"', type: "prompt"},
  {text: "We don't log or store your searches, IP address, or any other info", type: "about"},
  {text: '"Why is segwit a useful upgrade?"', type: "prompt"},
  {text: "Openly built with ❤️ by Chaincode Labs.", type: "about"},
  {text: '"What does SIGHASH_ALL do?"', type: "prompt"},
  {text: "Data from bitcoin dev mailing list, Bitcointalk, Lightning dev mailing list, Bitcoin StackExchange, Bitcoin Optech,BTC Transcripts, and more", type: "about"},
]

const BackgroundHelper = () => {
  return (
    <Box p={2}>
      <Text mt={4} textAlign="center" fontSize={{base: "sm", md:"lg"}} fontWeight="bold" color="gray.400" >Explore & learn technical bitcoin concepts and their history</Text>
      <Grid templateColumns="1fr 1fr" gap={{base: 6, md: 8}} mt={{base: 14, md: 16}} w="80%" maxW="600px" mx="auto">
        <GridItem>
          <Flex direction="column" justifyContent="center" alignItems="center" gap={2}>
            <PencilIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
            <Text fontSize={{base: "12px", md: "18px"}} textAlign="center" fontWeight={700}>Prompt Examples</Text>
          </Flex>
        </GridItem>
        <GridItem>
          <Flex direction="column" justifyContent="center" alignItems="center" gap={2}>
            <LightBulbIcon
              fontSize={{ base: "4xl", md: "7xl" }}
              color="orange.400"
            />
            <Text fontSize={{base: "12px", md: "18px"}} textAlign="center" fontWeight={700}>About</Text>
          </Flex>
        </GridItem>
        {textBubbles.map((item, idx) => (
          <GridItem key={idx}>
            <TextBubble item={item} />
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
}

export default BackgroundHelper;

const TextBubble = ({item}: {item: TextBubble}) => {
  const isPrompt = item.type === "prompt"
  return (
    <Grid w="full" h="full" bgColor="gray.200" placeItems="center" p={2} rounded="xl" 
      // cursor={isPrompt ? "pointer" : ""}
      // _hover={isPrompt ? {bgColor: "orange.200"}: {}} 
    >
      <Text fontSize={{base: "10px", md: "14px"}} fontWeight={{base: 600, md: 400}} 
        textAlign="center" color="gray.900"
        cursor={"default"}
        // cursor={isPrompt ? "pointer" : "default"}
      >
          {item.text}
      </Text>
    </Grid>
  )
}
