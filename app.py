from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Curriculum Vitae")

app.mount("/", StaticFiles(directory="dist", html=True), name="static")
