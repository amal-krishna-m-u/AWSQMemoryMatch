export const shuffleCards = (cards) => {
  return cards.sort(() => Math.random() - 0.5);
};

export const generateCardDeck = () => {
  const icons = ['S3', 'EC2', 'Lambda', 'Code Suggestions', 'DynamoDB', 'CloudFront', 'RDS', 'SageMaker', 'Redshift', 'Elastic Beanstalk'];
  const cards = icons.flatMap(icon => [{ icon, id: `${icon}-1` }, { icon, id: `${icon}-2` }]);
  return shuffleCards(cards).slice(0, 25); // Ensure a 5x5 grid (25 cards)
};

export const amazonFacts = [
  "Amazon started as an online bookstore in 1994.",
  "AWS launched its first service, S3, in 2006.",
  "Amazon is named after the world's largest river, the Amazon River.",
  "AWS Lambda was introduced in 2014 for serverless computing.",
  "Amazon employs over 1.5 million people worldwide.",
  "AWS has data centers in over 25 geographic regions.",
  "Amazon Prime was launched in 2005 to offer faster shipping."
];

export const getRandomFact = () => {
  return amazonFacts[Math.floor(Math.random() * amazonFacts.length)];
};