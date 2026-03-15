# Test Runner Helper Scripts

Este archivo contiene comandos útiles para ejecutar tests

## 🧪 Comandos de Test

### Ejecutar todos los tests
```bash
npm run test
```

### Ejecutar tests en modo watch
```bash
npx playwright test --watch
```

### Ejecutar tests de un archivo específico
```bash
npx playwright test tests/generate.util.spec.ts
npx playwright test tests/slug.util.spec.ts
npx playwright test tests/formatter.spec.ts
npx playwright test tests/integration.spec.ts
```

### Ejecutar tests con reporte detallado
```bash
npx playwright test --reporter=list
```

### Depurar tests
```bash
npm run test:debug
```

### Ver reporte HTML
```bash
npm run test:report
```

### Ejecutar tests en modo UI (interactivo)
```bash
npm run test:ui
```

## 📊 Análisis de Coverage

Para ver qué tests están pasando/fallando:

```bash
npx playwright test --reporter=html
```

## 🔍 Filtrar Tests

### Por nombre
```bash
npx playwright test -g "should format"
```

### Por archivo
```bash
npx playwright test tests/slug
```

## 🐛 Debugging

### Ejecutar un solo test
```bash
npx playwright test tests/generate.util.spec.ts:10
```

### Ver trace de tests fallidos
```bash
npx playwright show-trace trace.zip
```

## 📝 Notas

- Los tests se ejecutan en paralelo por defecto
- En CI/CD se ejecutan secuencialmente para mayor estabilidad
- Los tests fallidos se reintentan 2 veces en CI
