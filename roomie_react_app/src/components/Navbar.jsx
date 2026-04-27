import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Stack,
  Link,
  Container,
} from "@chakra-ui/react";
import { FiX, FiMenu } from "react-icons/fi";
import { NavLink, useNavigate } from "react-router-dom";
import {
  AUTH_CHANGE_EVENT,
  clearAuthSession,
  getAuthToken,
  ROLE_ADMIN,
  getUserRole,
} from "@/util/auth";

const navLinks = [
  { label: "Početna", href: "/" },
  { label: "Sobe", href: "/rooms" },
  { label: "Poruke", href: "/chat" },
  { label: "Profil", href: "/profile" },
  { label: "Admin", href: "/admin" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => getAuthToken());
  const [userRole, setUserRole] = useState(() => getUserRole());
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => {
      setAuthToken(getAuthToken());
      setUserRole(getUserRole());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState);
    window.addEventListener("storage", syncAuthState);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <Box
      id="navbar"
      bg="gray.800"
      color="white"
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={10}
      width="100%"
    >
      <Container>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Link
            as={NavLink}
            to="/"
            fontWeight="bold"
            fontSize="xl"
            focusRing="none"
            _hover={{ textDecoration: "none", color: "teal.300" }}
            _focus={{ boxShadow: "none" }}
          >
            Roomie
          </Link>

          <IconButton
            size="lg"
            variant="outline"
            aria-label={isOpen ? "Zatvori izbornik" : "Otvori izbornik"}
            display={{ base: "inline-flex", md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </IconButton>

          <HStack gap={8} spacing={8} display={{ base: "none", md: "flex" }}>
            {navLinks.map((link) =>
              link.label === "Admin" && userRole !== ROLE_ADMIN ? null : (
                <Link
                  as={NavLink}
                  key={link.href}
                  to={link.href}
                  fontWeight="medium"
                  _hover={{ color: "teal.300", textDecoration: "none" }}
                  _focus={{ boxShadow: "none" }}
                  transition="color 0.2s"
                  focusRing="none"
                >
                  {link.label}
                </Link>
              ),
            )}
            {authToken ? (
              <Button
                size="md"
                variant="solid"
                focusRing="none"
                onClick={() => {
                  clearAuthSession();
                  navigate("/login");
                }}
              >
                Odjava
              </Button>
            ) : (
              <Button
                size="md"
                variant="solid"
                focusRing="none"
                as={NavLink}
                to="/login"
              >
                Prijava
              </Button>
            )}
          </HStack>
        </Flex>

        {isOpen && (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={8} alignItems="center" gap="8">
              {navLinks.map((link) =>
                link.label === "Admin" && userRole !== ROLE_ADMIN ? null : (
                  <Link
                    fontSize="1.5rem"
                    as={NavLink}
                    key={link.href}
                    to={link.href}
                    fontWeight="medium"
                    _hover={{ color: "teal.300", textDecoration: "none" }}
                    _focus={{ boxShadow: "none" }}
                    onClick={onClose}
                    focusRing="none"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              {authToken ? (
                <Button
                  fontSize="1.5rem"
                  variant="outline"
                  focusRing="none"
                  onClick={() => {
                    clearAuthSession();
                    navigate("/login");
                  }}
                >
                  Odjava
                </Button>
              ) : (
                <Button
                  fontSize="1.5rem"
                  variant="outline"
                  focusRing="none"
                  as={NavLink}
                  to="/login"
                >
                  Prijava
                </Button>
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Navbar;
