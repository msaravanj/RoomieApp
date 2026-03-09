import { Box, Heading, Text, HStack, Button } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

const Banner = () => {
  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      py={{ base: "3rem", md: "5rem" }}
      px="2rem"
      textAlign="center"
      color="white"
    >
      <Heading as="h1" size="6xl" mb="4" fontWeight="700">
        Welcome to Roomie
      </Heading>
      <Text fontSize="xl" opacity="0.95" mb="6" fontWeight="400">
        Find your perfect roommate
      </Text>
      {localStorage.getItem("token") == null && (
        <HStack spacing="4" justify="center" margin="3rem" gap="1rem">
          <Button
            colorScheme="whiteAlpha"
            size="lg"
            variant="solid"
            as={NavLink}
            to="/login"
          >
            Login
          </Button>
          <Button
            colorScheme="whiteAlpha"
            size="lg"
            variant="outline"
            as={NavLink}
            to="/signup"
          >
            Register
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default Banner;
