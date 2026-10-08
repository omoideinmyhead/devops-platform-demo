from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from app.cards import CARD_BY_ID, POSITIONS

class DrawRequest(BaseModel):
    spread: Literal['one', 'three'] = 'three'

class DrawnCard(BaseModel):
    model_config = ConfigDict(extra='forbid')
    card_id: str
    position: str
    orientation: Literal['upright', 'reversed']

class ReadingRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    spread: Literal['one', 'three']
    cards: list[DrawnCard]

    @field_validator('question')
    @classmethod
    def clean_question(cls, value):
        value = value.strip()
        if len(value) < 3:
            raise ValueError('Please enter a question of at least three characters.')
        return value

    @model_validator(mode='after')
    def check_cards(self):
        positions = POSITIONS[self.spread]
        if len(self.cards) != len(positions):
            raise ValueError('Card count does not match spread.')
        ids = [card.card_id for card in self.cards]
        if len(set(ids)) != len(ids) or any(cid not in CARD_BY_ID for cid in ids):
            raise ValueError('Cards must be unique valid deck cards.')
        if [card.position for card in self.cards] != positions:
            raise ValueError('Card positions do not match spread.')
        return self

class CardInterpretation(BaseModel):
    model_config = ConfigDict(extra='forbid')
    card_id: str
    interpretation: str

class ReadingContent(BaseModel):
    model_config = ConfigDict(extra='forbid')
    title: str
    overall: str
    cards: list[CardInterpretation]
    reflection_prompts: list[str]

class ReadingResponse(ReadingContent):
    mode: Literal['demo', 'ai']
