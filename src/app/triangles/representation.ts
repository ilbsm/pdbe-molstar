import { ParamDefinition as PD } from 'Molstar/mol-util/param-definition';
import { Representation, RepresentationContext, RepresentationParamsGetter } from 'Molstar/mol-repr/representation';
import { Vec3 } from 'Molstar/mol-math/linear-algebra/3d';
import { MeshBuilder } from 'Molstar/mol-geo/geometry/mesh/mesh-builder';
import { RuntimeContext } from 'Molstar/mol-task';
import { ShapeRepresentation } from 'Molstar/mol-repr/shape/representation';
import { Color } from 'Molstar/mol-util/color/color';
import { Mesh } from 'Molstar/mol-geo/geometry/mesh/mesh';
import { Shape } from 'Molstar/mol-model/shape/shape';



interface TriangleData {
    vertices: number[],
    size: number
    index: number
}

export const TriangleParams = {
    ...Mesh.Params,
    doubleSided: PD.Boolean(true)
};
export type TriangleParams = typeof TriangleParams;
export type TriangleProps = PD.Values<TriangleParams>

const TriangleVisuals = {
    'mesh': (ctx: RepresentationContext, getParams: RepresentationParamsGetter<TriangleData, TriangleParams>) => ShapeRepresentation(getTriangleShape, Mesh.Utils)
};

function getTriangleMesh(data: TriangleData, props: TriangleProps, mesh?: Mesh) {
    // Here I'm trying to create custom mesh from plain vertices array.
    // Example array is simple Triangle
    const state = MeshBuilder.createState(256, 128, mesh);
    MeshBuilder.addTriangle(state,
        Vec3.create(data.vertices[0], data.vertices[1], data.vertices[0 + 2]),
        Vec3.create(data.vertices[3], data.vertices[4], data.vertices[5]),
        Vec3.create(data.vertices[6], data.vertices[7], data.vertices[8]),
    );
    return MeshBuilder.getMesh(state);
}

function getTriangleShape(ctx: RuntimeContext, data: TriangleData, props: TriangleProps, shape?: Shape<Mesh>) {
    const geo = getTriangleMesh(data, props, shape && shape.geometry);
    return Shape.create(`Triangle ${data.index}`, data, geo, () => Color.fromRgb(0, 0, 0), () => data.size, () => `Triangle ${data.index}`);
}
export type TriangleRepresentation = Representation<TriangleData, TriangleParams>

export function TriangleRepresentation(ctx: RepresentationContext, getParams: RepresentationParamsGetter<TriangleData, TriangleParams>): TriangleRepresentation {
    return Representation.createMulti('Triangle', ctx, getParams, Representation.StateBuilder, TriangleVisuals as unknown as Representation.Def<TriangleData, TriangleParams>);
}