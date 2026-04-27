import { Box, Button, Card, Text, HStack } from "@chakra-ui/react";
import { LuMapPin, LuUsers } from "react-icons/lu";
import CarouselComp from "./CarouselComp";
import { Suspense } from "react";

const RoomCard = (props) => {
  const formatMatchingScore = (score) => {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return score;
    }

    const percentage = numericScore <= 1 ? numericScore * 100 : numericScore;
    return `${Math.round(percentage)}%`;
  };

  return (
    <Card.Root maxW="30rem" overflow="hidden">
      <Suspense fallback={<div>...</div>}>
        <CarouselComp photos={props.photos} />
      </Suspense>
      <Card.Body gap="2">
        <HStack align="start" justify="space-between" w="100%">
          <Box>
            <Card.Title>{props.title}</Card.Title>
            <HStack gap="1" align="center">
              <LuMapPin />
              <Text as="span" onClick={props.openMapDialog} cursor="pointer">
                {props.address}, {props.city}
              </Text>
            </HStack>
            <Text
              textStyle="2xl"
              fontWeight="medium"
              letterSpacing="tight"
              mt="2"
            >
              {props.price} €
            </Text>
            <HStack gap="1" align="center">
              <LuUsers />
              <Text as="span">{props.capacity} cimera</Text>
            </HStack>
          </Box>
          {props.matching?.score !== undefined &&
            props.matching?.score !== null && (
              <Box
                alignSelf="stretch"
                minW="8.5rem"
                pl="4"
                borderLeftWidth="1px"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
              >
                <Text fontSize="sm" fontWeight="medium" color="green.500">
                  Roomie podudaranje
                </Text>
                <Text
                  fontSize="3xl"
                  fontWeight="extrabold"
                  lineHeight="1"
                  color="green.500"
                >
                  {formatMatchingScore(props.matching?.score)}
                </Text>
              </Box>
            )}
        </HStack>
      </Card.Body>
      <Card.Footer>
        <Button
          variant="solid"
          onClick={() => {
            props.openRoomDialog();
          }}
        >
          Pogledaj
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default RoomCard;
