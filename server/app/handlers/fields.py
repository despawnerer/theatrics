from marshmallow import fields


class CommaSeparatedList(fields.List):
    def _serialize(self, value, attr, obj):
        result = super()._serialize(value, attr, obj)
        return ','.join(result) if result is not None else None

    def _deserialize(self, value, attr, data):
        if not isinstance(value, str):
            self.fail('invalid')

        value = value.split(',')
        if any(item == '' for item in value):
            self.fail('invalid')
        return super()._deserialize(value, attr, data)
