# Operation Shadow — AI-Aligned Quiz Bank

This review copy contains question prompts and options only. **Correct-answer mappings must remain in Supabase's private `question_keys` table and must never be committed to this public repository or included in frontend JavaScript.**

Each question is worth 10 points. Five questions per round = 50 automatic points.

## Round 1 — Detect the Breach

### 1. ANN and structured data
A detector receives a structured feature vector containing device familiarity, location change, MFA outcome, and recent account changes. Which model family is a reasonable fit for learning relationships among these features?

- A. Artificial Neural Network (ANN)
- B. Convolutional Neural Network (CNN) designed for image inputs
- C. Recurrent Neural Network (RNN) used specifically to process ordered sequences
- D. A Transformer used only for raw image pixels

### 2. Reduce false positives
Which feature strategy is most likely to help a login-risk detector distinguish suspicious activity from a legitimate user travelling?

- A. Treat every unfamiliar IP address as a confirmed compromise
- B. Ignore MFA and device signals
- C. Combine location change with known-device history, MFA results, and related account activity
- D. Use only the email subject line

### 3. CNN fundamentals
What is the main role of convolution filters in a CNN processing a screenshot?

- A. To sort security events by timestamp
- B. To learn local visual patterns that can be combined into higher-level image features
- C. To guarantee that every detected page is malicious
- D. To store a user's password

### 4. Visual phishing evidence
A CNN flags a login-page screenshot as visually suspicious. What is the most defensible next step?

- A. Declare the page malicious without any other checks
- B. Send test credentials to the page to see what happens
- C. Delete the screenshot so the alert cannot recur
- D. Review the visual evidence alongside the URL/domain and other safe telemetry, then report uncertainty

### 5. Useful detector output
Which output best supports a security analyst's decision?

- A. A risk score or label with supporting evidence, limitations, and recommended verification steps
- B. A claim that the attacker is identified even when no identity evidence exists
- C. A red warning with no explanation
- D. A request to paste passwords or authentication tokens into the tool

## Round 2 — Trace the Attack

### 1. RNN sequence modelling
A team wants to analyse an ordered series of events — email delivered, link opened, sign-in anomaly, then a mailbox rule added. Which model family is specifically designed to process sequences step by step?

- A. A static image classifier only
- B. A database index
- C. A Recurrent Neural Network (RNN)
- D. A model that ignores event order

### 2. LSTM memory
What is a key idea behind LSTM networks when learning from longer event sequences?

- A. They turn every input into an image
- B. Gating mechanisms help retain or discard information as the sequence is processed
- C. They prove causation from timestamp order alone
- D. They remove the need for training examples

### 3. Transformer attention
In a Transformer analysing an alert and an email excerpt, what does self-attention help the model do?

- A. Guarantee that the most recent event is malicious
- B. Replace source logs with generated text
- C. Recover events that were never recorded
- D. Model relationships between tokens so relevant context can influence interpretation

### 4. Interpret correlated evidence
Logs show three file-portal previews after a suspicious sign-in, but no download or network-transfer evidence is available. What is the most defensible conclusion?

- A. The previews suggest possible file access, but they do not by themselves prove exfiltration
- B. Data theft is confirmed
- C. The sign-in must have been legitimate
- D. All files were definitely deleted

### 5. Incomplete evidence
How should an AI-assisted timeline tool handle missing or ambiguous evidence?

- A. Fill the gaps with the most dramatic explanation
- B. Hide events that contradict its first hypothesis
- C. Separate observed facts from hypotheses, identify evidence gaps, and communicate uncertainty
- D. Label every model-generated statement as a confirmed fact

## Alignment notes

- Round 1 teaches ANN and CNN concepts and applies them to structured account telemetry and visual phishing clues.
- Round 2 teaches RNN/LSTM sequence modelling and Transformer attention/context, then applies them to timeline reconstruction.
- The demo remains separately judged on analysis (15), technical quality (15), evidence and limitations (10), and usability/explanation (10).
- Use synthetic workshop data only. Model outputs support human review; they are not proof by themselves.
- Before publishing these questions in Supabase, update each question's private answer-key row in the same controlled change and validate scoring. Do not update the currently active round in the middle of a participant session.
