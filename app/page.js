"use client";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { marked } from "marked";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Headstarter support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return; // Don't send empty messages
    setIsLoading(true);

    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
      }

      // Parse the text as JSON and extract the message content
      const parsedResponse = JSON.parse(text);
      const responseText = parsedResponse.text || '';
      console.log(parsedResponse);
      console.log(responseText);

      // Convert Markdown to HTML using marked
      const formattedResponse = marked(responseText);

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: formattedResponse },
        ];
      });
    } catch (error) {
      console.error("Error generating content:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f4f6f8"
      p={{ xs: 0, md: 2 }}
    >
      <Stack
        direction={"column"}
        width={{ xs: "100%", md: "700px" }}
        height={{ xs: "100%", md: "700px" }}
        borderRadius={4}
        boxShadow="0px 4px 20px rgba(0, 0, 0, 0.1)"
        bgcolor="white"
        p={3}
        spacing={3}
        sx={{
          overflow: "hidden", // Prevent overflow on mobile
          maxWidth: "100%", // Ensure it doesn't exceed the screen width
          maxHeight: "100%", // Ensure it doesn't exceed the screen height
        }}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#c1c1c1",
              borderRadius: "8px",
            },
            fontSize: { xs: "0.875rem", md: "1rem" },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={4}
                p={2}
                mr={2}
                boxShadow="0px 2px 10px rgba(0, 0, 0, 0.1)"
                maxWidth="70%"
                dangerouslySetInnerHTML={{ __html: message.content }}
                sx={{
                  '& p': {
                    mb: 2,
                  },
                  '& pre': {
                    mb: 2,
                  },
                  '& li': {
                    pl: 4,
                  },
                }}
              />
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems="center">
          <TextField
            label="Message"
            fullWidth
            multiline
            minRows={1}
            maxRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            inputProps={{ sx: {
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c1c1c1",
                borderRadius: "8px",
              },
              fontSize: { xs: "0.875rem", md: "1rem" },
            } }} 
            
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              fontSize: { xs: "0.75rem", md: "1rem" },
            }}
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
