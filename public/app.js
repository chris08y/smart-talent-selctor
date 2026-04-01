const form = document.querySelector('#talent-form');
const smartAiButton = document.querySelector('#smart-ai-button');
const summaryTag = document.querySelector('#summary-tag');
const resultCard = document.querySelector('#result-card');
const aiPrompt = document.querySelector('#ai-prompt');
const generateAiButton = document.querySelector('#generate-ai');
const aiOutput = document.querySelector('#ai-output');
const heroMetric = document.querySelector('.hero-chart .metric span');
let heroMetricTimer;

const animateMetric = (target) => {
  if (!heroMetric) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 25));
  clearInterval(heroMetricTimer);
  heroMetricTimer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(heroMetricTimer);
    }
    heroMetric.textContent = `${current}%`;
  }, 20);
};

window.addEventListener('DOMContentLoaded', () => animateMetric(92));

const normalize = (value) => value.trim().toLowerCase();

const buildTagMarkup = (items) =>
  items
    .filter(Boolean)
    .map((label) => `<span class="suggestion-pill">${label}</span>`)
    .join(' ');

const computeMatch = ({ role, skills, culture, description }) => {
  const activeSkills = skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const candidateText = `${role} ${description}`.toLowerCase();
  const skillCount = activeSkills.length;
  const foundSkills = activeSkills.filter((skill) =>
    candidateText.includes(skill.toLowerCase())
  );

  const skillScore = skillCount === 0 ? 0 : Math.round((foundSkills.length / skillCount) * 100);
  const cultureScore = culture
    ? candidateText.includes(culture.toLowerCase())
      ? 100
      : 65
    : 70;

  const totalScore = Math.min(100, Math.round(skillScore * 0.7 + cultureScore * 0.3));

  const missingSkills = activeSkills.filter(
    (skill) => !foundSkills.includes(skill)
  );

  const recommendations = [];
  if (missingSkills.length) {
    recommendations.push(
      `Consider probing these missing areas: ${missingSkills.join(', ')}.`
    );
  }
  if (skillScore >= 80 && cultureScore >= 80) {
    recommendations.push('This candidate is aligned with the role and company culture.');
  }
  if (totalScore < 60) {
    recommendations.push('Use an interview question to validate technical depth and collaboration style.');
  }

  return {
    totalScore,
    skillScore,
    cultureScore,
    foundSkills,
    missingSkills,
    recommendations
  };
};

const renderResult = (data, formValues) => {
  const skillChips = buildTagMarkup(formValues.skills.split(',').map((skill) => skill.trim()));
  const cultureChips = formValues.culture
    ? `<span class="suggestion-pill">Culture: ${formValues.culture.trim()}</span>`
    : '';

  resultCard.innerHTML = `
    <div class="result-score">
      <div>
        <p>Talent score</p>
        <div class="score-badge">${data.totalScore}%</div>
      </div>
      <div class="score-bar" aria-hidden="true">
        <div class="score-fill" style="width: ${data.totalScore}%"></div>
      </div>
    </div>
    <div>
      <strong>Skill match</strong>
      <p>${data.foundSkills.length}/${formValues.skills.split(',').filter(Boolean).length} core skills recognized.</p>
      <div class="suggestion-list">${skillChips}</div>
    </div>
    <div>
      <strong>Fit insights</strong>
      <p>${data.recommendations.join(' ')}</p>
    </div>
    <div>
      <strong>Culture alignment</strong>
      <p>${cultureChips || 'No culture label provided. Add one to refine fit.'}</p>
    </div>
  `;

  summaryTag.textContent = data.totalScore >= 75 ? 'High potential' : data.totalScore >= 50 ? 'Consider interview' : 'Needs follow-up';
  summaryTag.style.color = data.totalScore >= 75 ? '#8cf89a' : data.totalScore >= 50 ? '#ffd572' : '#ff7d7d';
  animateMetric(data.totalScore);
};

const getFormValues = () => ({
  role: document.querySelector('#role-input').value,
  skills: document.querySelector('#skills-input').value,
  culture: document.querySelector('#culture-input').value,
  description: document.querySelector('#description-input').value
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const values = getFormValues();
  const result = computeMatch(values);
  renderResult(result, values);
});

const createAiPrompt = (values) => {
  const trimmedPrompt = aiPrompt.value.trim();
  if (trimmedPrompt) {
    return `${trimmedPrompt}

Candidate profile:
Role: ${values.role}
Skills: ${values.skills}
Culture: ${values.culture}
Summary: ${values.description}`;
  }

  return `Write a concise hiring evaluation for a candidate applying to ${values.role}.

Job requirements: ${values.skills}.
Culture fit: ${values.culture || 'Not specified'}.
Candidate summary: ${values.description}

Include one strength and one development area.`;
};

const sendAiRequest = async (promptText) => {
  aiOutput.textContent = 'Connecting to insight service…';
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: promptText })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Unknown API error');
    }

    const data = await response.json();
    aiOutput.textContent = data.message;
  } catch (error) {
    aiOutput.textContent = `Insight service unavailable: ${error.message}`;
  }
};

generateAiButton.addEventListener('click', () => {
  const values = getFormValues();
  const promptText = createAiPrompt(values);
  sendAiRequest(promptText);
});

smartAiButton.addEventListener('click', () => {
  const values = getFormValues();
  const promptText = `Create a short recommendation for hiring a candidate who matches these details.\n\nRole: ${values.role}\nSkills: ${values.skills}\nCulture: ${values.culture || 'Not defined'}\nSummary: ${values.description}`;
  sendAiRequest(promptText);
});
