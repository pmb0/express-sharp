FROM alpine
RUN apk add musl
ENV PORT=8080
WORKDIR /app
USER nobody
COPY main .
CMD [./main]
