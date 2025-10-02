class QuestionManager {
    constructor(dataFile, containerId = 'questions-list') {
        this.dataFile = dataFile;
        this.containerId = containerId;
        this.questions = [];
        this.displayedQuestions = [];
        this.isLoading = false;
    }

    async loadQuestions() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const response = await fetch(this.dataFile);
            if (!response.ok) {
                throw new Error(`Failed to load questions file: ${response.status}`);
            }
            const text = await response.text();
            this.questions = text.split('\n').map(q => q.trim()).filter(q => q.length > 0);
            this.fetchQuestions();
        } catch (error) {
            this.showError(`Error loading questions. Please check "${this.dataFile}".`);
            console.error('Failed to load questions:', error);
        } finally {
            this.isLoading = false;
        }
    }

    showLoadingState() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '<p>Loading questions...</p>';
    }

    showError(message) {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `<p class="error">${message}</p>`;
    }

    getRandomUniqueNumbers(max, count = 3) {
        const numbers = new Set();
        const maxCount = Math.min(count, max);

        while (numbers.size < maxCount) {
            numbers.add(Math.floor(Math.random() * max));
        }
        return Array.from(numbers);
    }

    fetchQuestions() {
        if (this.questions.length === 0) {
            this.showError(`No questions available. Please check the "${this.dataFile}" file.`);
            return;
        }

        const questionsList = document.getElementById(this.containerId);
        const questionIndexes = this.getRandomUniqueNumbers(this.questions.length);
        this.displayedQuestions = questionIndexes.map(index => this.questions[index]);

        questionsList.innerHTML = '';
        const ul = document.createElement('ul');

        this.displayedQuestions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            li.style.listStyleType = 'disc';
            li.classList.add('well');
            ul.appendChild(li);
        });

        questionsList.appendChild(ul);
    }

    async copyQuestions() {
        if (this.displayedQuestions.length === 0) {
            return;
        }

        const textToCopy = this.displayedQuestions.join('\n\n');
        const copyButton = document.getElementById('copy-button');

        try {
            await navigator.clipboard.writeText(textToCopy);
            copyButton.innerHTML = '<i class="fas fa-clipboard-check"></i> Copied!';
            setTimeout(() => {
                copyButton.innerHTML = '<i class="fas fa-clipboard"></i> Copy Questions';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for browsers that don't support clipboard API
            this.fallbackCopyToClipboard(textToCopy, copyButton);
        }
    }

    fallbackCopyToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            button.innerHTML = '<i class="fas fa-clipboard-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-clipboard"></i> Copy Questions';
            }, 2000);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }

        document.body.removeChild(textArea);
    }

    // Initialize the question manager
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadQuestions();
        });

        // Set current year in footer
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
}

// Global functions for button onclick handlers
let questionManager;

function fetchQuestions() {
    if (questionManager) {
        questionManager.fetchQuestions();
    }
}

function copyQuestions() {
    if (questionManager) {
        questionManager.copyQuestions();
    }
}