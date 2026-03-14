import React, { useState } from "react";
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
import { clearAuthSession } from "@/util/auth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Rooms", href: "/rooms" },
  { label: "Chat", href: "/chat" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onOpen = () => setIsOpen(true);
  const onClose = () => setIsOpen(false);
  const navigate = useNavigate();

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
            aria-label={isOpen ? "Close menu" : "Open menu"}
            display={{ base: "inline-flex", md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </IconButton>

          <HStack gap={8} spacing={8} display={{ base: "none", md: "flex" }}>
            {navLinks.map((link) => (
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
            ))}
            {localStorage.getItem("token") ? (
              <Button
                size="md"
                variant="solid"
                focusRing="none"
                onClick={() => {
                  clearAuthSession();
                  navigate("/login");
                  window.location.reload();
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                size="md"
                variant="solid"
                focusRing="none"
                as={NavLink}
                to="/login"
              >
                Login
              </Button>
            )}
          </HStack>
        </Flex>

        {isOpen && (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={8} alignItems="center" gap="8">
              {navLinks.map((link) => (
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
              ))}
              {localStorage.getItem("token") ? (
                <Button
                  fontSize="1.5rem"
                  variant="outline"
                  focusRing="none"
                  onClick={() => {
                    clearAuthSession();
                    navigate("/login");
                    window.location.reload();
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  fontSize="1.5rem"
                  variant="outline"
                  focusRing="none"
                  as={NavLink}
                  to="/login"
                >
                  Login
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
