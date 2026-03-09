import { Button, Card, Text, HStack } from "@chakra-ui/react";
import { LuMapPin, LuUsers } from "react-icons/lu";
import CarouselComp from "./CarouselComp";
import { Suspense } from "react";

const RoomCard = (props) => {
  return (
    <Card.Root maxW="30rem" overflow="hidden">
      <Suspense fallback={<div>...</div>}>
        <CarouselComp photos={props.photos} />
      </Suspense>
      <Card.Body gap="2">
        <Card.Title>{props.title}</Card.Title>
        <HStack gap="1" align="center">
          <LuMapPin />
          <Text as="span">
            {props.address}, {props.city}
          </Text>
        </HStack>
        <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
          {props.price} €
        </Text>
        <HStack gap="1" align="center">
          <LuUsers />
          <Text as="span">{props.capacity} roommates</Text>
        </HStack>
      </Card.Body>
      <Card.Footer>
        <Button
          variant="solid"
          onClick={() => {
            props.openDialog();
          }}
        >
          View
        </Button>
        <Button variant="ghost">Roommate info</Button>
      </Card.Footer>
    </Card.Root>
  );
};

export default RoomCard;
