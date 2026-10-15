"""Canonical 78-card deck. Artwork is drawn locally by the frontend."""
MAJOR = [
    ('The Fool', 'new beginnings', 'Trust curiosity and take a thoughtful first step.'),
    ('The Magician', 'possibility', 'Bring your skills and intentions into alignment.'),
    ('The High Priestess', 'intuition', 'Make room for the quieter wisdom within you.'),
    ('The Empress', 'nurturing', 'Give what matters time, care, and room to grow.'),
    ('The Emperor', 'structure', 'Create boundaries that support your intentions.'),
    ('The Hierophant', 'tradition', 'Consider which teachings support your own values.'),
    ('The Lovers', 'alignment', 'Choose with honesty about what matters to you.'),
    ('The Chariot', 'direction', 'Focus your energy on a deliberate next step.'),
    ('Strength', 'gentle courage', 'Meet uncertainty with patience and compassion.'),
    ('The Hermit', 'reflection', 'Step back to hear your own perspective clearly.'),
    ('Wheel of Fortune', 'change', 'Notice what is shifting and where you can adapt.'),
    ('Justice', 'balance', 'Weigh your choices fairly and take responsibility.'),
    ('The Hanged Man', 'perspective', 'A pause may reveal another way forward.'),
    ('Death', 'transformation', 'Consider what you are ready to release.'),
    ('Temperance', 'integration', 'Find a sustainable balance between your needs.'),
    ('The Devil', 'attachments', 'Notice habits that narrow your sense of choice.'),
    ('The Tower', 'reassessment', 'Question assumptions and build on firmer ground.'),
    ('The Star', 'hope', 'Reconnect with what renews your sense of possibility.'),
    ('The Moon', 'uncertainty', 'Distinguish intuition from assumptions and fear.'),
    ('The Sun', 'vitality', 'Notice what brings clarity, warmth, and energy.'),
    ('Judgement', 'renewal', 'Reflect on what you have learned before beginning again.'),
    ('The World', 'completion', 'Acknowledge progress and integrate the experience.'),
]
SUITS = {
    'Wands': ('creativity and initiative', 'Consider where you want to direct your energy.'),
    'Cups': ('feelings and connection', 'Listen to your feelings and the quality of your connections.'),
    'Swords': ('thought and communication', 'Look for clarity in your thinking and conversations.'),
    'Pentacles': ('resources and everyday life', 'Ground your intentions in practical care and action.'),
}
RANKS = {
    'Ace': 'a fresh opportunity', 'Two': 'a choice or partnership', 'Three': 'growth through collaboration',
    'Four': 'stability and pause', 'Five': 'tension and adjustment', 'Six': 'support and exchange',
    'Seven': 'assessment and persistence', 'Eight': 'movement and practice', 'Nine': 'personal integration',
    'Ten': 'fulfillment and responsibility', 'Page': 'curiosity and learning', 'Knight': 'action and momentum',
    'Queen': 'care and inner confidence', 'King': 'maturity and stewardship',
}
CARDS = []
for index, (name, keyword, meaning) in enumerate(MAJOR):
    CARDS.append(dict(id=f'major-{index}', name=name, arcana='Major Arcana', suit=None,
                      number=index, keyword=keyword, meaning=meaning,
                      reversed_meaning=f'Look inward: {meaning[0].lower()}{meaning[1:]}'))
for suit, (theme, meaning) in SUITS.items():
    for index, (rank, lesson) in enumerate(RANKS.items()):
        CARDS.append(dict(id=f'{suit.lower()}-{index + 1}', name=f'{rank} of {suit}',
                          arcana='Minor Arcana', suit=suit, number=index + 1,
                          keyword=lesson, meaning=f'Explore {lesson} in {theme}. {meaning}',
                          reversed_meaning=f'Reconsider {lesson} in {theme}. {meaning}'))
CARD_BY_ID = {card['id']: card for card in CARDS}
POSITIONS = {'one': ['Your guiding energy'], 'three': ['What brought you here', 'Where you are', 'A possible path']}
