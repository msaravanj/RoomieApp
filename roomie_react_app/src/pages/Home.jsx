import Banner from "@/components/Banner";
import { Heading, Text, Box, Container } from "@chakra-ui/react";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <Box>
      <Banner />

      <Container
        maxW="1200px"
        py={{ base: "8", md: "16" }}
        px={{ base: "4", md: "8" }}
      >
        <Box
          id="textBlock"
          bg="transparent"
          p={{ base: "6", md: "12" }}
          borderRadius="lg"
          mb={{ base: "12", md: "20" }}
        >
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            textAlign="center"
            mb="6"
            fontWeight="700"
            color="white"
          >
            Pronađi cimera s kojim se zaista razumiješ
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            textAlign="center"
            maxW="600px"
            mx="auto"
            lineHeight="1.8"
            color="gray.200"
          >
            Pronalaženje cimera nije samo pitanje cijene – radi se o životnom
            stilu, navikama i osjećaju doma. Roomie ti pomaže da se povežeš s
            ljudima koji se stvarno podudaraju s tvojim načinom života. Naš
            pametan sustav podudaranja na temelju životnog stila osigurava da ne
            dijeliš samo prostor, već i energiju.
          </Text>
        </Box>

        <Box
          id="textBlock2"
          bg="transparent"
          p={{ base: "6", md: "12" }}
          borderRadius="lg"
          borderLeft="none"
        >
          <Heading
            as="h2"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            textAlign="center"
            mb="6"
            fontWeight="700"
            color="white"
          >
            Počni s podudaranjem još danas
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            textAlign="center"
            maxW="600px"
            mx="auto"
            lineHeight="1.8"
            color="gray.200"
          >
            Kreiraj svoj profil, ispuni razgovor o životnom stilu, i otkrij
            cimere koji se uklapaju uz tebe - ne samo u tvoj budžet. Registriraj
            se sada i napravi prvi korak prema boljoj zajedničkoj iskustvu
            života.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
