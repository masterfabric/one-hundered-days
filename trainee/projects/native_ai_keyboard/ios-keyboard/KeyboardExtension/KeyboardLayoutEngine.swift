import UIKit

/// Builds keyplane rows from `KeyboardLayoutSpec` across run-loop turns (KeyboardKit layout-engine pattern, UIKit-only).
enum KeyboardLayoutEngine {
    struct Metrics {
        let horizontalSpacing: CGFloat
        let row2HorizontalInset: CGFloat
        let shiftDeleteWidth: CGFloat
        let bottomSideKeyWidth: CGFloat
    }

    struct Context {
        let metrics: Metrics
        let makeLetterKey: (Character) -> UIView
        let makeFunctionalKey: (String, CGFloat?) -> UIView
        let configureExpandableRow: (UIStackView) -> Void
        let configureUniformLetterKey: (UIView) -> Void
        let appendKey: (UIView, UIStackView) -> Void
        let onShiftKeyResolved: (UIButton) -> Void
        let log: (String) -> Void
    }

    /// Builds the full keyplane on the main thread in one pass (no per-key run-loop deferral).
    static func buildSynchronously(
        spec: KeyboardLayoutSpec,
        context: Context,
        onRowInstalled: (UIStackView) -> Void
    ) {
        for rowSpec in spec.rows {
            let row: UIStackView
            switch rowSpec.style {
            case .uniform:
                row = buildUniformRowSync(rowSpec: rowSpec, context: context)
            case .staggered:
                row = buildStaggeredRowSync(rowSpec: rowSpec, context: context)
            case .shiftMiddle:
                row = buildShiftMiddleRowSync(rowSpec: rowSpec, context: context)
            case .bottom:
                row = buildBottomRowSync(rowSpec: rowSpec, context: context)
            }
            context.log("keyplane row: \(rowSpec.label) done")
            onRowInstalled(row)
        }
    }

    static func buildDeferred(
        spec: KeyboardLayoutSpec,
        rowIndex: Int,
        keyIndex: Int,
        partialRow: UIStackView?,
        partialMiddleRow: UIStackView?,
        context: Context,
        onRowInstalled: @escaping (UIStackView) -> Void,
        onComplete: @escaping () -> Void
    ) {
        guard rowIndex < spec.rows.count else {
            onComplete()
            return
        }

        let rowSpec = spec.rows[rowIndex]

        switch rowSpec.style {
        case .uniform:
            buildUniformRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex,
                row: partialRow,
                context: context,
                onRowComplete: { row in
                    onRowInstalled(row)
                    buildDeferred(
                        spec: spec,
                        rowIndex: rowIndex + 1,
                        keyIndex: 0,
                        partialRow: nil,
                        partialMiddleRow: nil,
                        context: context,
                        onRowInstalled: onRowInstalled,
                        onComplete: onComplete
                    )
                }
            )
        case .staggered:
            buildStaggeredRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex,
                row: partialRow,
                context: context,
                onRowComplete: { row in
                    onRowInstalled(row)
                    buildDeferred(
                        spec: spec,
                        rowIndex: rowIndex + 1,
                        keyIndex: 0,
                        partialRow: nil,
                        partialMiddleRow: nil,
                        context: context,
                        onRowInstalled: onRowInstalled,
                        onComplete: onComplete
                    )
                }
            )
        case .shiftMiddle:
            buildShiftMiddleRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex,
                row: partialRow,
                middleRow: partialMiddleRow,
                context: context,
                onRowComplete: { row in
                    onRowInstalled(row)
                    buildDeferred(
                        spec: spec,
                        rowIndex: rowIndex + 1,
                        keyIndex: 0,
                        partialRow: nil,
                        partialMiddleRow: nil,
                        context: context,
                        onRowInstalled: onRowInstalled,
                        onComplete: onComplete
                    )
                }
            )
        case .bottom:
            buildBottomRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex,
                row: partialRow,
                context: context,
                onRowComplete: { row in
                    onRowInstalled(row)
                    buildDeferred(
                        spec: spec,
                        rowIndex: rowIndex + 1,
                        keyIndex: 0,
                        partialRow: nil,
                        partialMiddleRow: nil,
                        context: context,
                        onRowInstalled: onRowInstalled,
                        onComplete: onComplete
                    )
                }
            )
        }
    }

    private static func makeRowStack(
        rowSpec: KeyboardLayoutRowSpec,
        context: Context
    ) -> UIStackView {
        context.log("keyplane row: \(rowSpec.label)")
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.spacing = context.metrics.horizontalSpacing
        stack.alignment = .fill
        switch rowSpec.style {
        case .uniform, .staggered:
            stack.distribution = .fillEqually
        case .shiftMiddle, .bottom:
            stack.distribution = .fill
        }
        if case .staggered(let inset) = rowSpec.style {
            stack.isLayoutMarginsRelativeArrangement = true
            stack.layoutMargins = UIEdgeInsets(top: 0, left: inset, bottom: 0, right: inset)
            stack.accessibilityIdentifier = "kb_row_staggered"
        }
        context.configureExpandableRow(stack)
        return stack
    }

    private static func buildUniformRowSync(rowSpec: KeyboardLayoutRowSpec, context: Context) -> UIStackView {
        let row = makeRowStack(rowSpec: rowSpec, context: context)
        for item in rowSpec.items {
            guard case .letter(let letter) = item else { continue }
            let key = context.makeLetterKey(letter)
            context.configureUniformLetterKey(key)
            context.appendKey(key, row)
        }
        return row
    }

    private static func buildStaggeredRowSync(rowSpec: KeyboardLayoutRowSpec, context: Context) -> UIStackView {
        let row = makeRowStack(rowSpec: rowSpec, context: context)
        for item in rowSpec.items {
            guard case .letter(let letter) = item else { continue }
            let key = context.makeLetterKey(letter)
            context.configureUniformLetterKey(key)
            context.appendKey(key, row)
        }
        return row
    }

    private static func buildShiftMiddleRowSync(rowSpec: KeyboardLayoutRowSpec, context: Context) -> UIStackView {
        let row = makeRowStack(rowSpec: rowSpec, context: context)
        let shift = context.makeFunctionalKey("shift", context.metrics.shiftDeleteWidth)
        if let shiftBtn = shift as? UIButton {
            context.onShiftKeyResolved(shiftBtn)
        }
        context.appendKey(shift, row)

        let middle = UIStackView()
        middle.axis = .horizontal
        middle.spacing = context.metrics.horizontalSpacing
        middle.distribution = .fillEqually
        middle.alignment = .fill
        middle.setContentHuggingPriority(.defaultLow, for: .horizontal)
        middle.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
        for item in rowSpec.items {
            guard case .letter(let letter) = item else { continue }
            let key = context.makeLetterKey(letter)
            context.configureUniformLetterKey(key)
            context.appendKey(key, middle)
        }
        row.addArrangedSubview(middle)

        let del = context.makeFunctionalKey("⌫", context.metrics.shiftDeleteWidth)
        context.appendKey(del, row)
        return row
    }

    private static func buildBottomRowSync(rowSpec: KeyboardLayoutRowSpec, context: Context) -> UIStackView {
        let row = makeRowStack(rowSpec: rowSpec, context: context)
        for item in rowSpec.items {
            let key: UIView?
            switch item {
            case .numbersToggle:
                key = context.makeFunctionalKey("123", context.metrics.bottomSideKeyWidth)
            case .space:
                let space = context.makeFunctionalKey("space", nil)
                space.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
                space.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
                key = space
            case .return:
                key = context.makeFunctionalKey("return", context.metrics.bottomSideKeyWidth)
            default:
                key = nil
            }
            if let key {
                context.appendKey(key, row)
            }
        }
        return row
    }

    private static func buildUniformRowDeferred(
        rowSpec: KeyboardLayoutRowSpec,
        keyIndex: Int,
        row: UIStackView?,
        context: Context,
        onRowComplete: @escaping (UIStackView) -> Void
    ) {
        DispatchQueue.main.async {
            let row = row ?? makeRowStack(rowSpec: rowSpec, context: context)
            let letterItems = rowSpec.items.compactMap { item -> Character? in
                if case .letter(let ch) = item { return ch }
                return nil
            }
            guard keyIndex < letterItems.count else {
                context.log("keyplane row: \(rowSpec.label) done")
                onRowComplete(row)
                return
            }
            let letter = letterItems[keyIndex]
            context.log("keyplane key: \(letter)")
            let key = context.makeLetterKey(letter)
            context.configureUniformLetterKey(key)
            context.appendKey(key, row)
            buildUniformRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex + 1,
                row: row,
                context: context,
                onRowComplete: onRowComplete
            )
        }
    }

    private static func buildStaggeredRowDeferred(
        rowSpec: KeyboardLayoutRowSpec,
        keyIndex: Int,
        row: UIStackView?,
        context: Context,
        onRowComplete: @escaping (UIStackView) -> Void
    ) {
        DispatchQueue.main.async {
            let row = row ?? makeRowStack(rowSpec: rowSpec, context: context)
            let letterItems = rowSpec.items.compactMap { item -> Character? in
                if case .letter(let ch) = item { return ch }
                return nil
            }
            guard keyIndex < letterItems.count else {
                context.log("keyplane row: \(rowSpec.label) done")
                onRowComplete(row)
                return
            }
            let letter = letterItems[keyIndex]
            context.log("keyplane key: \(letter)")
            let key = context.makeLetterKey(letter)
            context.configureUniformLetterKey(key)
            context.appendKey(key, row)
            buildStaggeredRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex + 1,
                row: row,
                context: context,
                onRowComplete: onRowComplete
            )
        }
    }

    private static func buildShiftMiddleRowDeferred(
        rowSpec: KeyboardLayoutRowSpec,
        keyIndex: Int,
        row: UIStackView?,
        middleRow: UIStackView?,
        context: Context,
        onRowComplete: @escaping (UIStackView) -> Void
    ) {
        DispatchQueue.main.async {
            if keyIndex == 0 {
                let outer = makeRowStack(rowSpec: rowSpec, context: context)
                let shift = context.makeFunctionalKey("shift", context.metrics.shiftDeleteWidth)
                if let shiftBtn = shift as? UIButton {
                    context.onShiftKeyResolved(shiftBtn)
                }
                context.appendKey(shift, outer)
                let middle = UIStackView()
                middle.axis = .horizontal
                middle.spacing = context.metrics.horizontalSpacing
                middle.distribution = .fillEqually
                middle.alignment = .fill
                middle.setContentHuggingPriority(.defaultLow, for: .horizontal)
                middle.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
                buildShiftMiddleRowDeferred(
                    rowSpec: rowSpec,
                    keyIndex: 1,
                    row: outer,
                    middleRow: middle,
                    context: context,
                    onRowComplete: onRowComplete
                )
                return
            }

            guard let row, let middleRow else { return }
            let letterCount = rowSpec.items.filter {
                if case .letter = $0 { return true }
                return false
            }.count

            if keyIndex <= letterCount {
                guard case .letter(let letter) = rowSpec.items[keyIndex] else {
                    buildShiftMiddleRowDeferred(
                        rowSpec: rowSpec,
                        keyIndex: keyIndex + 1,
                        row: row,
                        middleRow: middleRow,
                        context: context,
                        onRowComplete: onRowComplete
                    )
                    return
                }
                context.log("keyplane key: \(letter)")
                let key = context.makeLetterKey(letter)
                context.configureUniformLetterKey(key)
                context.appendKey(key, middleRow)
                if keyIndex == 1 {
                    row.addArrangedSubview(middleRow)
                }
                buildShiftMiddleRowDeferred(
                    rowSpec: rowSpec,
                    keyIndex: keyIndex + 1,
                    row: row,
                    middleRow: middleRow,
                    context: context,
                    onRowComplete: onRowComplete
                )
                return
            }

            if keyIndex == letterCount + 1 {
                context.log("keyplane key: delete")
                let del = context.makeFunctionalKey("⌫", context.metrics.shiftDeleteWidth)
                context.appendKey(del, row)
                context.log("keyplane row: \(rowSpec.label) done")
                onRowComplete(row)
            }
        }
    }

    private static func buildBottomRowDeferred(
        rowSpec: KeyboardLayoutRowSpec,
        keyIndex: Int,
        row: UIStackView?,
        context: Context,
        onRowComplete: @escaping (UIStackView) -> Void
    ) {
        DispatchQueue.main.async {
            let row = row ?? makeRowStack(rowSpec: rowSpec, context: context)
            guard keyIndex < rowSpec.items.count else {
                context.log("keyplane row: \(rowSpec.label) done")
                onRowComplete(row)
                return
            }

            let item = rowSpec.items[keyIndex]
            let key: UIView
            switch item {
            case .numbersToggle:
                context.log("keyplane key: 123")
                key = context.makeFunctionalKey("123", context.metrics.bottomSideKeyWidth)
            case .space:
                context.log("keyplane key: space")
                key = context.makeFunctionalKey("space", nil)
                key.setContentHuggingPriority(UILayoutPriority(1), for: .horizontal)
                key.setContentCompressionResistancePriority(.defaultLow, for: .horizontal)
            case .return:
                context.log("keyplane key: return")
                key = context.makeFunctionalKey("return", context.metrics.bottomSideKeyWidth)
            default:
                buildBottomRowDeferred(
                    rowSpec: rowSpec,
                    keyIndex: keyIndex + 1,
                    row: row,
                    context: context,
                    onRowComplete: onRowComplete
                )
                return
            }
            context.appendKey(key, row)
            buildBottomRowDeferred(
                rowSpec: rowSpec,
                keyIndex: keyIndex + 1,
                row: row,
                context: context,
                onRowComplete: onRowComplete
            )
        }
    }
}
