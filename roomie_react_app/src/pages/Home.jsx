import Banner from "@/components/Banner";
import { Heading, Text, Box } from "@chakra-ui/react";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div>
      <Banner />
      <Box id="textBlock" className={styles.textBlock}>
        <Heading as="h2" fontSize="3xl" className={styles.heading}>
          Find a roommate you actually click with
        </Heading>
        <Text
          fontSize="lg"
          mx="auto"
          maxW="38rem"
          mb={16}
          className={styles.text}
        >
          Finding a roommate isn’t just about rent — it’s about lifestyle,
          habits, and feeling at home. Roomie helps you connect with people who
          truly match your way of living. Our smart lifestyle-based matching
          makes sure you don’t just share a space, but also a vibe.
        </Text>
      </Box>
      <Box id="textBlock2" className={styles.textBlock}>
        <Heading as="h2" fontSize="3xl" className={styles.heading}>
          Start your match today
        </Heading>
        <Text
          fontSize="lg"
          mx="auto"
          maxW="38rem"
          mb={16}
          className={styles.text}
        >
          Create your profile, complete your lifestyle chat, and discover
          roommates who fit you — not just your budget. Sign up now and take the
          first step toward a better shared living experience.
        </Text>
      </Box>
    </div>
  );
};

export default Home;
