import {
  Box,
  Heading,
  Input,
  Field,
  Button,
  Text,
  NativeSelect,
  HStack,
  RadioGroup,
  Link,
} from "@chakra-ui/react";
import { NavLink, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password-input";
import styles from "./Signup.module.css";
import { useState } from "react";
import { Toaster, toaster } from "@/components/ui/toaster";
import { setAuthSession } from "@/util/auth";

const Signup = () => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [yob, setYob] = useState(2005);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("Muško");
  const [hasAccomodation, setHasAccomodation] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const navigate = useNavigate();

  const urlCreateUser = "http://localhost:8080/api/auth/register";
  const optionsCreateUser = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      lastName: surname,
      email: email,
      yob: yob,
      password: password,
      city: city,
      gender: gender,
      hasAccomodation: hasAccomodation,
    }),
  };

  const checkPassword = () => {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  };

  const createUser = async () => {
    if (checkPassword() === true) {
      setButtonLoading(true);
      const response = await fetch(urlCreateUser, optionsCreateUser);
      if (response.status === 500) {
        setButtonLoading(false);
        toaster.create({
          description: "Desila se greška na serveru.",
          type: "error",
        });
        return false;
      } else if (response.status === 409) {
        setButtonLoading(false);
        toaster.create({
          description: "Email je već u upotrebi.",
          type: "warning",
        });
        return false;
      } else if (response.ok) {
        setButtonLoading(false);
        toaster.create({
          description: "Registracija uspješna!",
          type: "success",
        });
        // reset form fields

        setName("");
        setSurname("");
        setGender("Muško");
        setCity("");
        setYob(2005);

        return true;
      }
    } else {
      toaster.create({
        description:
          "Lozinka mora biti najmanje 8 znakova i uključiti velika slova, mala slova, brojeve i posebne znakove.",
        type: "warning",
      });
      setButtonLoading(false);
      return false;
    }
  };

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
        description: "Nevaljana email ili lozinka.",
        type: "error",
      });
    } else if (response.ok) {
      toaster.create({
        description: "Prijava uspješna!",
        type: "success",
      });

      const data = await response.json();
      setAuthSession({
        token: data.token,
        userId: data.userId,
        expiresInMs: data.jwtExpirationMs,
      });
      setPassword("");
      setEmail("");

      if (hasAccomodation === true) {
        setHasAccomodation(true);
        setTimeout(() => {
          navigate("/new-place");
          window.location.reload();
        }, 1000);
      } else {
        setHasAccomodation(true);
        setTimeout(() => {
          navigate("/rooms");
          window.location.reload();
        }, 1000);
      }
    }
  };

  return (
    <Box>
      <Box bg="gray.800" className={styles.signupBox}>
        <Heading as="h2" fontSize="2xl" mb={4} className={styles.heading}>
          Kreiraj račun
        </Heading>
        <Text mb={4}>
          Već imaš račun?{" "}
          <Link as={NavLink} color="teal" variant="underline" to="/login">
            Prijava
          </Link>
        </Text>
        <Field.Root mb={4} required>
          <Field.Label>
            Ime <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4} required>
          <Field.Label>
            Prezime <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Spol</Field.Label>
          <RadioGroup.Root defaultValue="Muško" value={gender}>
            <HStack gap="6">
              <RadioGroup.Item
                key="male"
                value="Muško"
                onClick={() => {
                  setGender("Muško");
                }}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>Muško</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item
                key="female"
                value="Žensko"
                onClick={() => {
                  setGender("Žensko");
                }}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>Žensko</RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label mt={4} mb={2}>
            Godina rođenja
          </Field.Label>

          <NativeSelect.Root size="sm" width="6rem" mb={4}>
            <NativeSelect.Field
              value={yob}
              onChange={(e) => setYob(Number(e.currentTarget.value))}
            >
              {Array.from({ length: 80 }, (_, i) => 2015 - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Field.Root mb={4} required>
          <Field.Label>
            Grad <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4} required>
          <Field.Label>
            Email adresa <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4} required>
          <Field.Label>
            Lozinka <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Smještaj</Field.Label>
          <NativeSelect.Root size="sm" width="full">
            <NativeSelect.Field
              value={hasAccomodation}
              onChange={(e) =>
                setHasAccomodation(
                  e.currentTarget.value === "true" ? true : false,
                )
              }
            >
              <option value="true">Imam mjesto za dijeljenje</option>
              <option value="false">Trebam mjesto i cimera</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
        <Button
          variant="surface"
          colorScheme="teal"
          size="md"
          width="full"
          _hover={{ backgroundColor: "teal.600" }}
          loading={buttonLoading}
          disabled={
            name === "" ||
            email === "" ||
            surname === "" ||
            !email.includes("@") ||
            password === "" ||
            city === ""
          }
          onClick={async () => {
            setButtonLoading(true);
            try {
              const created = await createUser();
              if (created) {
                // attempt login after successful registration
                await loginUser();
              }
            } finally {
              setButtonLoading(false);
            }
          }}
        >
          Registracija
        </Button>
      </Box>
      <Toaster />
    </Box>
  );
};

export default Signup;
