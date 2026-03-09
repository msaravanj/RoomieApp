import { Avatar, HStack, Stack, Text, Box } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";

const ConversationSelect = (props) => {
  let [searchParams, setSearchParams] = useSearchParams();
  return (
    <HStack
      gap="8"
      alignItems="center"
      padding="4"
      _hover={{ bg: "gray.800" }}
      cursor="pointer"
      position="relative"
      onClick={() => {
        setSearchParams("id=" + props.userId);
        if (props.onRead) {
          props.onRead();
        }
      }}
    >
      <Avatar.Root>
        <Avatar.Fallback name={props.name} />
        <Avatar.Image src={props.photoUrl} />
      </Avatar.Root>
      <Stack gap="0" flex="1">
        <Text fontWeight="medium">{props.name}</Text>
        {props.lastMessage.length > 24 ? (
          <Text color="fg.muted" textStyle="sm">
            {props.lastMessage.slice(0, 24) + "..."}
          </Text>
        ) : (
          <Text color="fg.muted" textStyle="sm">
            {props.lastMessage}
          </Text>
        )}
      </Stack>
      {props.hasUnread && (
        <Box
          width="10px"
          height="10px"
          borderRadius="50%"
          bg="blue.500"
          position="absolute"
          right="4"
        />
      )}
    </HStack>
  );
};

export default ConversationSelect;
