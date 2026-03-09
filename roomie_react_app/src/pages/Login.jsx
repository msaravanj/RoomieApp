import {
  Box,
  Heading,
  Input,
  Field,
  Button,
  Separator,
  HStack,
  Text,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password-input";
import styles from "./FormStyles.module.css";
import { Toaster, toaster } from "@/components/ui/toaster";
import { setAuthSession } from "@/util/auth";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [buttonLoading, setButtonLoading] = useState(false);

  const urlLoginUser = "http://localhost:8080/api/auth/login";
  const optionsLoginUser = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  };

  const loginUser = async () => {
    const response = await fetch(urlLoginUser, optionsLoginUser);
    if (response.status === 401) {
      toaster.create({
        description: "Invalid email or password.",
        type: "error",
      });
    } else if (response.ok) {
      toaster.create({
        description: "Login successful!",
        type: "success",
      });

      const data = await response.json();
      setAuthSession({
        token: data.token,
        userId: data.userId,
        expiresInMs: data.jwtExpirationInMs,
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    }
  };

  return (
    <Box>
      <Box bg="gray.800" className={styles.loginBox}>
        <Heading as="h2" fontSize="2xl" mb={4} className={styles.heading}>
          Login to your account
        </Heading>

        <Field.Root mb={4}>
          <Field.Label>Email address</Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Password</Field.Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field.Root>
        <Button
          variant="surface"
          colorScheme="teal"
          size="md"
          width="full"
          _hover={{ backgroundColor: "teal.600" }}
          loading={buttonLoading}
          onClick={() => {
            setButtonLoading(true);
            loginUser();
            setButtonLoading(false);
          }}
        >
          Log in
        </Button>
        <HStack marginTop={2}>
          <Separator borderColor="gray.600" flex="1" />
          <Text flexShrink="0">New to Roomie?</Text>
          <Separator borderColor="gray.600" flex="1" />
        </HStack>
        <Button
          as={NavLink}
          to="/signup"
          variant="surface"
          colorScheme="teal"
          size="md"
          width="full"
          _hover={{ backgroundColor: "teal.600" }}
        >
          Create an account
        </Button>
      </Box>
      <Toaster />
    </Box>
  );
};

export default Login;
