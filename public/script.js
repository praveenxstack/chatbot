document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesArea = document.getElementById('chat-messages');
    const initialView = document.getElementById('initial-view');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
    });

    // Handle Enter key
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Handle Suggestions
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            sendMessage(prompt);
        });
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prompt = userInput.value.trim();
        if (prompt) {
            sendMessage(prompt);
        }
    });

    async function sendMessage(prompt) {
        // Switch views if first message
        if (initialView.style.display !== 'none') {
            initialView.style.display = 'none';
            messagesArea.style.display = 'flex';
        }

        // Add user message
        addMessage(prompt, 'user');

        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show typing indicator
        const typingIndicator = addTypingIndicator();
        scrollToBottom();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();
            typingIndicator.remove();

            if (data.response) {
                addMessage(data.response, 'ai');
            } else {
                addMessage(`Error: ${data.error || 'Something went wrong'}`, 'ai');
            }
        } catch (error) {
            typingIndicator.remove();
            addMessage('Failed to connect to the server.', 'ai');
        }

        scrollToBottom();
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const label = sender === 'user' ? 'You' : 'Nexus AI';

        // Use marked to parse markdown (e.g., **bold** -> <strong>)
        // This removes the raw asterisks and replaces them with clean formatting
        const content = sender === 'ai' ? marked.parse(text) : text;

        messageDiv.innerHTML = `
            <span class="message-label">${label}</span>
            <div class="message-content">${content}</div>
        `;

        messagesArea.appendChild(messageDiv);
        scrollToBottom();
    }

    function addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message', 'ai-message');
        indicatorDiv.innerHTML = `
            <span class="message-label">Nexus AI</span>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesArea.appendChild(indicatorDiv);
        return indicatorDiv;
    }

    function scrollToBottom() {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
});
