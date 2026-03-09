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
  const [gender, setGender] = useState("Male");
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
          description: "Server error occurred.",
          type: "error",
        });
        return false;
      } else if (response.status === 409) {
        setButtonLoading(false);
        toaster.create({
          description: "Email already in use.",
          type: "warning",
        });
        return false;
      } else if (response.ok) {
        setButtonLoading(false);
        toaster.create({
          description: "Registration successful!",
          type: "success",
        });
        // reset form fields

        setName("");
        setSurname("");
        setGender("Male");
        setCity("");
        setYob(2005);

        return true;
      }
    } else {
      toaster.create({
        description:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
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
          Create an account
        </Heading>
        <Text mb={4}>
          Already have an account?{" "}
          <Link as={NavLink} color="teal" variant="underline" to="/login">
            Log in
          </Link>
        </Text>
        <Field.Root mb={4} required>
          <Field.Label>
            Name <Field.RequiredIndicator />
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
            Surname <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Gender</Field.Label>
          <RadioGroup.Root defaultValue="Male" value={gender}>
            <HStack gap="6">
              <RadioGroup.Item
                key="male"
                value="Male"
                onClick={() => {
                  setGender("Male");
                }}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>Male</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item
                key="female"
                value="Female"
                onClick={() => {
                  setGender("Female");
                }}
              >
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>Female</RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>
        </Field.Root>
        <Field.Root>
          <Field.Label mt={4} mb={2}>
            Year of birth
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
            City <Field.RequiredIndicator />
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
            Email address <Field.RequiredIndicator />
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
            Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field.Root>
        <Field.Root mb={4}>
          <Field.Label>Accommodation</Field.Label>
          <NativeSelect.Root size="sm" width="full">
            <NativeSelect.Field
              value={hasAccomodation}
              onChange={(e) =>
                setHasAccomodation(
                  e.currentTarget.value === "true" ? true : false,
                )
              }
            >
              <option value="true">I have a place to share</option>
              <option value="false">
                I'm looking for a place and a roommate
              </option>
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
          onClick={() => {
            const flag = createUser();
            if (flag) {
              setTimeout(() => {
                loginUser();
              }, 1000);
            }
          }}
        >
          Sign up
        </Button>
      </Box>
      <Toaster />
    </Box>
  );
};

export default Signup;
