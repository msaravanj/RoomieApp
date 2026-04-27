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
import { normalizeUserRole, setAuthSession } from "@/util/auth";
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
    try {
      setButtonLoading(true);

      const response = await fetch(urlLoginUser, optionsLoginUser);

      if (response.status === 401) {
        toaster.create({
          description: "Nevaljana email ili lozinka.",
          type: "error",
        });
        return;
      }

      if (!response.ok) {
        toaster.create({
          description: "Prijava nije uspjela. Pokušaj ponovno.",
          type: "error",
        });
        return;
      }

      toaster.create({
        description: "Prijava uspješna!",
        type: "success",
      });

      const data = await response.json();
      setAuthSession({
        token: data.token,
        userId: data.userId,
        expiresInMs: data.jwtExpirationInMs,
        userRole: normalizeUserRole(data.role),
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <Box>
      <Box bg="gray.800" className={styles.loginBox}>
        <Heading as="h2" fontSize="2xl" mb={4} className={styles.heading}>
          Prijava u tvoj račun
        </Heading>

        <Field.Root mb={4}>
          <Field.Label>Email adresa</Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Lozinka</Field.Label>
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
          onClick={loginUser}
        >
          Prijava
        </Button>
        <HStack marginTop={2}>
          <Separator borderColor="gray.600" flex="1" />
          <Text flexShrink="0">Novi na Roomie-ju?</Text>
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
          Kreiraj račun
        </Button>
      </Box>
      <Toaster />
    </Box>
  );
};

export default Login;
